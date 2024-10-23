const {
  multiSelectMode,
  daoId,
  proposal,
  proposal_type,
  proposal_id,
  i,
  isAllowedTo,
  isCongressDaoID,
  daoConfig,
  isHuman,
  isVotingBodyDao
} = props;
const accountId = context.accountId;

// --- check user permissions
const proposalKinds = {
  ChangeConfig: "config",
  ChangePolicy: "policy",
  AddMemberToRole: "add_member_to_role",
  RemoveMemberFromRole: "remove_member_from_role",
  FunctionCall: isCongressDaoID ? "FunctionCall" : "call",
  UpgradeSelf: "upgrade_self",
  UpgradeRemote: "upgrade_remote",
  Transfer: "transfer",
  SetStakingContract: "set_vote_token",
  AddBounty: "add_bounty",
  BountyDone: "bounty_done",
  Vote: "vote",
  FactoryInfoUpdate: "factory_info_update",
  ChangePolicyAddOrUpdateRole: "policy_add_or_update_role",
  ChangePolicyRemoveRole: "policy_remove_role",
  ChangePolicyUpdateDefaultVotePolicy: "policy_update_default_vote_policy",
  ChangePolicyUpdateParameters: "policy_update_parameters",
  Text: "Text",
  FundingRequest: "FundingRequest",
  RecurrentFundingRequest: "RecurrentFundingRequest",
  DismissAndBan: "DismissAndBan"
};

const actions = {
  AddProposal: "AddProposal",
  VoteApprove: "VoteApprove",
  VoteReject: "VoteReject",
  VoteRemove: "VoteRemove",
  VoteAbstain: "VoteAbstain"
};

const kindName =
  typeof proposal.kind === "string"
    ? proposal.kind
    : isCongressDaoID || isVotingBodyDao
    ? Object.keys(proposal.kind)?.[0]
    : typeof proposal.kind.typeEnum === "string"
    ? proposal.kind.typeEnum
    : Object.keys(proposal.kind)[0];

const isAllowedToVote = isVotingBodyDao
  ? [isHuman, isHuman, isHuman, isHuman]
  : [
      isAllowedTo(proposalKinds[kindName], actions.VoteApprove),
      isAllowedTo(proposalKinds[kindName], actions.VoteReject),
      isCongressDaoID
        ? isAllowedTo(proposalKinds[kindName], actions.VoteAbstain)
        : isAllowedTo(proposalKinds[kindName], actions.VoteRemove)
    ];

// --- end check user permissions

const formatDate = (date) => {
  date = new Date(parseInt(`${date}`.slice(0, 13)));
  return `${
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ][date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
};

function checkVotesForCongressDao(value) {
  if (isCongressDaoID) {
    return votes[accountId]?.vote === value;
  } else {
    return votes[accountId || ";;;"] === value;
  }
}

const voted = {
  yes: checkVotesForCongressDao("Approve"),
  no: checkVotesForCongressDao("Reject"),
  spam: isVotingBodyDao
    ? checkVotesForCongressDao("Spam")
    : checkVotesForCongressDao("Remove"),
  abstain: checkVotesForCongressDao("Abstain")
};

const alreadyVoted = voted.yes || voted.no || voted.spam || voted.abstain;

const canVote =
  isAllowedToVote.every((v) => v) &&
  proposal.status === "InProgress" &&
  !alreadyVoted;

const showMultiVote = multiSelectMode && canVote;

function renderStatus(statusName) {
  let statusicon;
  let statustext;
  let statusvariant;

  switch (statusName) {
    case "Approved":
    case "Accepted":
      statusicon = "bi bi-check-circle";
      statustext = statusName;
      statusvariant = "success";
      break;
    case "Executed":
      statusicon = "bi bi-play-fill";
      statustext = statusName;
      statusvariant = "success";
      break;
    case "In Progress":
    case "InProgress":
      statusicon = "spinner-border spinner-border-sm";
      statustext = "In Progress";
      statusvariant = "primary";
      break;
    case "Vetoed":
      statusicon = "bi bi-x-circle";
      statustext = "Vetoed";
      statusvariant = "black";
      break;
    case "Expired":
      statusicon = "bi bi-clock";
      statustext = "Expired";
      statusvariant = "black";
      break;
    case "Failed":
      statusicon = "bi bi-x-circle";
      statustext = "Failed";
      statusvariant = "black";
      break;
    case "Rejected":
      statusicon = "bi bi-ban";
      statustext = "Rejected";
      statusvariant = "danger";
      break;
    case "PreVote":
    case "Pre Vote":
      statusicon = "bi bi-hourglass-split";
      statustext = "Pre Vote";
      statusvariant = "disabled";
      break;
  }
  return (
    <Widget
      src="/*__@replace:nui__*//widget/Element.Badge"
      props={{
        children: (
          <>
            <i
              className={statusicon}
              style={{
                fontSize: "16px",
                marginRight: "5px",
                borderWidth: "2px",
                animationDuration: "3s"
              }}
            ></i>
            {statustext}
          </>
        ),
        variant: `${statusvariant} round`,
        size: "lg"
      }}
    />
  );
}

const execProposal = ({ daoId, proposal_id }) =>
  Near.call(daoId, "execute", { id: proposal_id }, 150000000000000);

return (
  <tr
    style={
      !!multiSelectMode && !canVote
        ? {
            opacity: 0.6
          }
        : {}
    }
  >
    <th scope="row">
      <span className="id-value">#{proposal_id}</span>
    </th>
    <td>{formatDate(proposal.submission_time)}</td>
    <td>
      <Widget
        src="mob.near/widget/Profile.ShortInlineBlock"
        props={{
          accountId: proposal.proposer,
          tooltip: true
        }}
      />
    </td>
    <td className="text-center">{kindName}</td>
    <td>
      {proposal.description.length < 95
        ? proposal.description
        : `${proposal.description.slice(0, 92)}...`}
    </td>
    <td className="text-center">
      {isVotingBodyDao
        ? proposal.status === "PreVote"
          ? proposal?.support ?? 0
          : (proposal?.approve ?? 0) +
            (proposal?.reject ?? 0) +
            (proposal?.spam ?? 0) +
            (proposal?.abstain ?? 0)
        : Object.keys(proposal.votes ?? {}).length}
    </td>
    <td className="text-center">{renderStatus(proposal.status)}</td>

    {multiSelectMode && (
      <td className="text-center" style={{ width: 200 }}>
        <Widget
          src="/*__@appAccount__*//widget/DAO.Proposals.MultiVote"
          props={{
            daoId,
            canVote,
            proposal,
            view: "multiVote",
            isCongressDaoID,
            isVotingBodyDao,
            dev: props.dev
          }}
        />
      </td>
    )}
    <td style={{ width: 150 }}>
      <div className="d-flex justify-content-end gap-2">
        {(isCongressDaoID || isVotingBodyDao) &&
          proposal.status === "Approved" &&
          proposal?.submission_time +
            (daoConfig?.vote_duration ?? daoConfig?.voting_duration) +
            (daoConfig?.cooldown ?? 0) < // cooldown is not available in vb
            Date.now() && (
            <Widget
              src="nearui.near/widget/Input.Button"
              props={{
                variant: "primary icon",
                children: <i class="bi bi-caret-right-fill" />,
                onClick: () => execProposal({ daoId, proposal_id })
              }}
            />
          )}
        <Widget
          src="/*__@appAccount__*//widget/Layout.Modal"
          props={{
            toggle: (
              <Widget
                src="nearui.near/widget/Input.Button"
                props={{
                  children: "More details",
                  variant: !!multiSelectMode && !canVote ? "disabled" : "info",
                  disabled: !!multiSelectMode && !canVote
                }}
              />
            ),
            modalWidth: "1000px",
            content: (
              <div
                style={{
                  width: 1000,
                  maxWidth: "100%"
                }}
              >
                <Widget
                  src="astraplusplus.ndctools.near/widget/DAO.Proposals.Card.index"
                  props={{
                    daoId: daoId,
                    proposalString: JSON.stringify(proposal),
                    multiSelectMode: state.multiSelectMode,
                    isCongressDaoID,
                    isVotingBodyDao,
                    daoConfig,
                    dev: props.dev
                  }}
                />
              </div>
            )
          }}
        />
      </div>
    </td>
  </tr>
);
