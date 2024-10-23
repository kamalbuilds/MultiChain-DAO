const {
  id,
  typeName,
  proposer,
  description,
  kind,
  statusName,
  totalVotesNeeded,
  totalVotes,
  submission_time,
  votes
} = props.proposal;
const {
  daoId,
  isAllowedToVote,
  multiSelectMode,
  proposal,
  policy,
  handleVote,
  handlePreVoteAction,
  comments,
  isCongressDaoID,
  isVotingBodyDao,
  daoConfig,
  isHuman,
  currentuserCongressHouse,
  CoADaoId,
  HoMDaoId,
  registry,
  showNavButton
} = props;
const proposalURL = `https://near.org//*__@appAccount__*//widget/home?page=dao&tab=proposals&daoId=${daoId}&proposalId=${
  proposal.id
}${props.dev ? "&dev=true" : ""}`;
const accountId = context.accountId;
const [showNotificationModal, setNotificationModal] = useState(false);
const [voteDetails, setVoteDetails] = useState(null);
const expirationTime =
  isCongressDaoID || isVotingBodyDao
    ? submission_time +
      (daoConfig?.vote_duration ?? daoConfig?.voting_duration ?? 0)
    : policy?.proposal_period
    ? parseInt(
        Big(submission_time).add(Big(policy.proposal_period)).div(1000000)
      )
    : null;
function checkVotesForCongressDao(value) {
  if (isCongressDaoID) {
    return votes[accountId]?.vote === value;
  } else if (isVotingBodyDao) {
    const userVote = useCache(
      () =>
        Near.asyncView(daoId, "get_vote", {
          id: proposal.id,
          voter: accountId
        }).then((vote) => vote),
      proposal.id + "vote",
      { subscribe: false }
    );
    return userVote.vote === value;
  } else return votes[accountId || ";;;"] === value;
}

// TODO: implement category
const category = "";

const Wrapper = styled.div`
  margin: 16px auto;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 500px;
  width: 100%;
  border: 1px solid #fff;
  a {
    color: rgb(68, 152, 224) !important;
  }
  .word-wrap {
    word-wrap: break-word;
  }

  ${({ status }) =>
    status === "Approved" &&
    `
    border-color: #82E299;
  `}

  ${({ status }) =>
    status === "In Progress" &&
    `
    border-color: #fff;
  `}

  ${({ status }) =>
    (status === "Failed" || status === "Rejected") &&
    `
    border-color: #C23F38;
  `}

    /* Tooltip container */
    .custom-tooltip {
    position: relative;
    display: inline-block;
  }

  /* Tooltip text */
  .custom-tooltip .tooltiptext {
    visibility: hidden;
    width: auto;
    background-color: #555;
    color: #fff;
    text-align: center;
    padding: 5px;
    border-radius: 6px;

    /* Position the tooltip text */
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 0%;

    /* Fade in tooltip */
    opacity: 0;
    transition: opacity 0.3s;
  }

  /* Tooltip arrow */
  .custom-tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }

  /* Show the tooltip text when you mouse over the tooltip container */
  .custom-tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }

  .text-sm {
    font-size: 14px;
  }

  .counter-text {
    font-size: 14px;
    margin-right: 5px;
    border-width: 2px;
    animation-duration: 8s;
  }

  .text-center {
    text-align: center;
  }

  .info_section {
    border-right: 1px solid #dee2e6;
    padding-right: 15px;
    margin: 10px 15px 10px 0;

    &.no-border {
      border: 0;
    }

    @media (max-width: 768px) {
      border: 0;
    }
  }
`;

const cls = (c) => c.join(" ");

const YouVotedBadge = () => {
  return (
    <Widget
      src="/*__@replace:nui__*//widget/Element.Badge"
      props={{
        size: "sm",
        variant: "info outline mb-1",
        children: "You voted"
      }}
    />
  );
};

function renderPermission({ isAllowedToVote }) {
  return (
    <div
      className={"text-center p-2 rounded-pill"}
      style={{
        backgroundColor: isAllowedToVote ? "#82E29926" : "#C23F381A"
      }}
    >
      {isAllowedToVote
        ? "You are allowed to vote on this proposal"
        : "You are not allowed to vote on this proposal"}
    </div>
  );
}

const execProposal = ({ daoId, id }) =>
  Near.call(daoId, "execute", { id }, 150000000000000);

const slashPreVoteProposal = ({ id }) =>
  Near.call(daoId, "slash_prevote_proposal", { id }, 300000000000000);

function renderHeader({ typeName, id, daoId, statusName }) {
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
      statustext = statusName;
      statusvariant = "black";
      break;
    case "Expired":
      statusicon = "bi bi-clock";
      statustext = statusName;
      statusvariant = "black";
      break;
    case "Failed":
      statusicon = "bi bi-x-circle";
      statustext = statusName;
      statusvariant = "black";
      break;
    case "Rejected":
      statusicon = "bi bi-ban";
      statustext = statusName;
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
    <div className="card__header">
      <div className="d-flex flex-column gap-2">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <h4>{typeName}</h4>
            {showNavButton && (
              <a target="_blank" rel="noopener noreferrer" href={proposalURL}>
                <h5>
                  <i class="bi bi-box-arrow-up-right"></i>
                </h5>
              </a>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            {(isCongressDaoID || isVotingBodyDao) &&
              statusName === "Approved" &&
              expirationTime + (daoConfig?.cooldown ?? 0) < // cooldown is not available in vb
                Date.now() && (
                <Widget
                  src="nearui.near/widget/Input.Button"
                  props={{
                    variant: "primary icon",
                    children: <i class="bi bi-caret-right-fill" />,
                    onClick: () => execProposal({ daoId, id })
                  }}
                />
              )}
            {isVotingBodyDao && statusName === "Spam" && (
              <Widget
                src="nearui.near/widget/Input.Button"
                props={{
                  variant: "danger",
                  children: "Slash",
                  onClick: () => execProposal({ daoId, id })
                }}
              />
            )}
            {isVotingBodyDao &&
              statusName === "Pre Vote" &&
              proposal?.submission_time + daoConfig?.pre_vote_duration <
                Date.now() && (
                <Widget
                  src="nearui.near/widget/Input.Button"
                  props={{
                    variant: "danger",
                    children: "Slash",
                    onClick: () =>
                      slashPreVoteProposal({
                        id
                      })
                  }}
                />
              )}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <Widget
            src="/*__@replace:nui__*//widget/Element.Badge"
            props={{
              children: `Proposal ID #${id}`,
              variant: `outline info round`,
              size: "lg"
            }}
          />
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

          {statusName === "In Progress" && expirationTime > Date.now() && (
            <Widget
              src="/*__@replace:nui__*//widget/Element.Badge"
              props={{
                children: (
                  <div className="counter-text">
                    <Widget
                      src="/*__@appAccount__*//widget/Common.Layout.Countdown"
                      props={{
                        timeToCheck: expirationTime
                      }}
                    />
                  </div>
                ),
                variant: `info round`,
                size: "lg"
              }}
            />
          )}
          {isCongressDaoID &&
            daoConfig?.cooldown !== 0 &&
            statusName !== "In Progress" &&
            expirationTime + daoConfig?.cooldown > Date.now() && (
              <Widget
                src="/*__@replace:nui__*//widget/Element.Badge"
                props={{
                  children: (
                    <div className="d-flex gap-1 align-items-center counter-text">
                      <div>Cooldown:</div>
                      <Widget
                        src="/*__@appAccount__*//widget/Common.Layout.Countdown"
                        props={{
                          timeToCheck: expirationTime + daoConfig?.cooldown
                        }}
                      />
                    </div>
                  ),
                  variant: `disabled round`,
                  size: "lg"
                }}
              />
            )}
        </div>
      </div>
    </div>
  );
}

function renderData({
  proposer,
  category,
  description,
  submission_time,
  totalVotesNeeded
}) {
  return (
    <div className="d-flex gap-2 flex-column">
      <div className="d-flex gap-2">
        <div className="w-50">
          <div className="mb-2">
            <b>Proposer</b>
          </div>
          <Widget
            src="mob.near/widget/Profile.ShortInlineBlock"
            props={{ accountId: proposer, tooltip: true }}
          />
        </div>
        {category && (
          <div className="w-50">
            <h5 className="text-muted h6">Category</h5>
            <Widget
              src="/*__@replace:nui__*//widget/Element.Badge"
              props={{
                children: category,
                variant: `disabled round`,
                size: "lg"
              }}
            />
          </div>
        )}
      </div>
      <div className="mt-3 word-wrap">
        <b>Description</b>
        <Markdown text={description} />
      </div>

      <Widget
        src="/*__@appAccount__*//widget/Common.Modals.ProposalArguments"
        props={{ daoId, proposal }}
      />

      <div className="d-flex flex-wrap">
        {submission_time && (
          <div className="info_section">
            <b>Submitted at</b>
            <div>
              <small className="text-muted">
                {isCongressDaoID || isVotingBodyDao
                  ? new Date(submission_time).toLocaleString()
                  : new Date(
                      parseInt(Big(submission_time).div(1000000))
                    ).toLocaleString()}
              </small>
            </div>
          </div>
        )}
        {expirationTime && (
          <div className="info_section">
            <b>Expired at</b>
            <div>
              <small className="text-muted">
                {new Date(expirationTime).toLocaleString()}
              </small>
            </div>
          </div>
        )}
        {totalVotesNeeded > 0 && (
          <div className="info_section no-border">
            <b>Required Votes</b>
            <div>
              <small className="text-muted">{totalVotesNeeded}</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderVoteButtons({
  totalVotes,
  statusName,
  votes,
  accountId,
  isAllowedToVote,
  handleVote
}) {
  const finished = statusName !== "In Progress";
  const VoteButton = styled.button`
    width: 100%;
    border-radius: 15px;
    border: 1px solid transparent;
    padding: 0 20px;
    line-height: 45px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    color: rgb(var(--vote-button-color));

    --vote-button-bg: 130, 226, 153;
    --vote-button-color: 0, 0, 0;

    &.no {
      --vote-button-bg: 194, 63, 56;
    }

    &.no > div:last-child {
      color: #000;
      transition: all 0.4s ease-in-out;
    }
    ${({ finished, percentage, disabled }) => {
      if (finished) {
        if (percentage > 80) {
          return `
        &.no > div:last-child {
          color: rgb(var(--vote-button-color)) !important;
        }
      `;
        }
      } else if (!disabled) {
        return `
        &:hover.no > div:last-child {
          color: rgb(var(--vote-button-color)) !important;
        } 
        `;
      }
    }}}

    &.spam {
      --vote-button-bg: 245, 197, 24;
    }

    &.abstain {
        --vote-button-bg: 169, 169, 169;
      }

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 12px;
      transition: all 0.4s ease-in-out;
      z-index: 0;
      background-color: rgb(var(--vote-button-bg));
      ${({ percentage }) => `
        min-width: ${percentage && percentage > 5 ? `${percentage}%` : "5px"};
      `}
    }

    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 12px;
      transition: all 0.4s ease-in-out;
      z-index: 1;
      background-color: var(--vote-button-bg);

      min-width: ${({ percentage }) =>
        percentage && percentage > 5 ? `${percentage}%` : "5px"};

      ${({ finished, wins }) =>
        finished &&
        wins &&
        `
        display: none;
      `}
    }

    ${({ disabled }) =>
      !disabled &&
      `
    &:hover {
      &:before {
        min-width: 100%;
      }
    }
  `}

    & > div {
      z-index: 2;
    }

    & > div:last-child span {
      display: block;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;

      &:last-child {
        font-size: 12px;
        font-weight: 400;
      }
    }
  `;

  const denominator =
    isCongressDaoID || isVotingBodyDao ? totalVotes.total : totalVotesNeeded;

  const getPercentage = (vote) => {
    const percentage = Math.round((vote / denominator) * 100);
    return percentage || 0;
  };

  const percentages = {
    yes: getPercentage(totalVotes.yes),
    no: getPercentage(totalVotes.no),
    spam: getPercentage(totalVotes.spam),
    abstain: getPercentage(totalVotes.abstain)
  };

  const wins = {
    yes: statusName === "Approved",
    no: statusName === "Rejected",
    spam: statusName === "Failed" || statusName === "Spam",
    abstain: statusName === "Failed"
  };

  const voted = {
    yes: checkVotesForCongressDao("Approve"),
    no: checkVotesForCongressDao("Reject"),
    spam: isVotingBodyDao
      ? checkVotesForCongressDao("Spam")
      : checkVotesForCongressDao("Remove"),
    abstain: checkVotesForCongressDao("Abstain")
  };

  const alreadyVoted = isVotingBodyDao
    ? false // allow revote
    : voted.yes || voted.no || voted.spam || voted.abstain;
  const showVeto = daoId === HoMDaoId;

  const VotePercentage = ({ vote }) => (
    <div>
      <span>
        {percentages[vote]}
        <i className="bi bi-percent"></i>
      </span>
      <span>
        {totalVotes[vote]} {totalVotes[vote] === 1 ? "Vote" : "Votes"}
      </span>
    </div>
  );

  return (
    <div
      className="d-lg-grid d-flex flex-wrap gap-2 align-items-end"
      style={{
        gridTemplateColumns: showVeto
          ? "repeat(3,1fr) 120px"
          : isVotingBodyDao
          ? "repeat(4,1fr)"
          : "repeat(3,1fr)"
      }}
    >
      <div className="w-100">
        {voted.yes && <YouVotedBadge />}
        <VoteButton
          className="yes"
          percentage={percentages.yes}
          finished={finished}
          wins={wins.yes}
          myVote={voted.yes}
          onClick={() => handleVote("VoteApprove")}
          disabled={alreadyVoted || finished || !isAllowedToVote[0]}
        >
          <div>
            {wins.yes && (
              <span title="Yes won">
                <i className="bi bi-check-circle"></i>
              </span>
            )}
            <span className="text-sm">Approve</span>
          </div>
          <VotePercentage vote="yes" />
        </VoteButton>
      </div>
      <div className="w-100">
        {voted.no && <YouVotedBadge />}
        <VoteButton
          className="no"
          percentage={percentages.no}
          finished={finished}
          wins={wins.no}
          myVote={voted.no}
          onClick={() => handleVote("VoteReject")}
          disabled={alreadyVoted || finished || !isAllowedToVote[1]}
        >
          <div className="d-flex gap-2 align-items-center">
            {wins.no && (
              <span title="No won">
                <i className="bi bi-check-circle"></i>
              </span>
            )}
            <span className="text-sm">Reject</span>
          </div>
          <VotePercentage vote="no" />
        </VoteButton>
      </div>
      {(isVotingBodyDao || isCongressDaoID) && (
        <div className="w-100">
          {voted.abstain && <YouVotedBadge />}

          <VoteButton
            className="abstain"
            percentage={percentages.abstain}
            finished={finished}
            wins={wins.abstain}
            myVote={voted.abstain}
            onClick={() => handleVote("VoteAbstain")}
            disabled={alreadyVoted || finished || !isAllowedToVote[2]}
          >
            <div className="d-flex gap-2 align-items-center">
              <span>Abstain</span>
            </div>
            <VotePercentage vote="abstain" />
          </VoteButton>
        </div>
      )}
      {!isCongressDaoID && (
        <div className="w-100">
          {voted.spam && <YouVotedBadge />}

          <VoteButton
            className="spam"
            percentage={percentages.spam}
            finished={finished}
            wins={wins.spam}
            myVote={voted.spam}
            onClick={() =>
              handleVote(isVotingBodyDao ? "VoteSpam" : "VoteRemove")
            }
            disabled={alreadyVoted || finished || !isAllowedToVote[2]}
          >
            <div className="d-flex gap-2 align-items-center">
              <span>Spam</span>
            </div>
            <VotePercentage vote="spam" />
          </VoteButton>
        </div>
      )}

      {showVeto && (
        <div className="w-100">
          <Widget
            src="/*__@appAccount__*//widget/DAO.Proposal.Common.VetoButton"
            props={{
              daoId,
              proposal,
              isCongressDaoID,
              isVotingBodyDao,
              daoConfig,
              isHuman,
              currentuserCongressHouse,
              CoADaoId,
              HoMDaoId,
              registry,
              dev: props.dev
            }}
          />
        </div>
      )}
    </div>
  );
}

function renderMultiVoteButtons({ daoId, proposal, canVote }) {
  return (
    <Widget
      src="/*__@appAccount__*//widget/DAO.Proposals.MultiVote"
      props={{
        daoId,
        proposal,
        canVote,
        view: "multiVote",
        isCongressDaoID,
        isVotingBodyDao,
        dev: props.dev
      }}
    />
  );
}

function renderPreVoteButtons({ proposal }) {
  const voted = proposal?.supported?.includes(accountId);
  const slashActive =
    proposal?.submission_time + daoConfig?.pre_vote_duration < Date.now();
  return (
    <div
      className="d-lg-grid d-flex flex-wrap gap-2 align-items-end"
      style={{ gridTemplateColumns: "repeat(3,1fr)" }}
    >
      <button
        class="custom-tooltip btn btn-primary"
        disabled={currentuserCongressHouse === null || slashActive}
        onClick={() =>
          handlePreVoteAction({
            action: "support_proposal_by_congress",
            proposalId: proposal.id
          })
        }
      >
        <span class="tooltiptext">
          This proposal requires a Congressional member to support in order to
          move into the active status.
        </span>
        Congress Member UpVote
      </button>
      <div className="d-flex flex-column gap-1">
        <div style={{ width: "fit-content" }}>{voted && <YouVotedBadge />}</div>
        <button
          class="custom-tooltip btn btn-primary"
          disabled={!isHuman || voted || slashActive}
          onClick={() =>
            handlePreVoteAction({
              action: "support_proposal",
              proposalId: proposal.id
            })
          }
        >
          <span class="tooltiptext">
            This proposal requires a minimal support from 50 members in order to
            move into the active status.
          </span>
          Voting Body Support
        </button>
      </div>
      <button
        disabled={slashActive}
        class="custom-tooltip btn btn-primary"
        onClick={() =>
          handlePreVoteAction({
            action: "top_up_proposal",
            proposalId: proposal.id
          })
        }
      >
        <span class="tooltiptext">
          This proposal requires additional bond to support in order to move
          into the active status.
        </span>
        Bond to move to Active Status
      </button>
    </div>
  );
}

const [footerModal, setFooterModal] = useState({});

function renderFooter({ totalVotes, votes, comments, daoId, proposal }) {
  const items = [
    {
      title: "Comments",
      icon: "bi bi-chat-left-text",
      count: comments.length || 0,
      widget: "Common.Modals.Comments",
      props: {
        daoId,
        proposal,
        commentsCount: comments.length,
        item: {
          type: "dao_proposal_comment",
          path: `${daoId}/proposal/main`,
          proposal_id: proposal.id + "-beta"
        }
      }
    },
    {
      title: "Voters",
      icon: "bi bi-people",
      count: totalVotes.total,
      widget: "Common.Modals.Voters",
      props: {
        daoId,
        votes,
        totalVotes,
        isCongressDaoID,
        dev: props.dev,
        isVotingBodyDao,
        proposalId: proposal.id,
        votersCount: totalVotes.total
      }
    },
    {
      title: "Share",
      icon: "bi bi-share",
      widget: "Common.Modals.Share",
      props: {
        url: proposalURL,
        text: "Explore this new proposal from our DAO! Your support and feedback are essential as we work towards a decentralized future. Review the details and join the discussion here:"
      }
    }
  ];

  if (
    proposal.typeName !== "Text" &&
    proposal.typeName !== "Vote" &&
    proposal.typeName !== "TextSuper"
  ) {
    items.push({
      title: "More details",
      icon: "bi bi-three-dots",
      widget: "Common.Modals.ProposalArguments",
      props: {
        daoId,
        proposal,
        showCard: true
      }
    });
  }

  const renderModal = (item, index) => {
    const toggleKey = proposal.id + item.title;

    return (
      <Widget
        src="/*__@appAccount__*//widget/Layout.Modal"
        props={{
          open: footerModal[toggleKey],
          onOpenChange: () =>
            setFooterModal((prevState) => ({
              ...prevState,
              [toggleKey]: !prevState[toggleKey]
            })),
          content: (
            <Widget
              src={`/*__@appAccount__*//widget/${item.widget}`}
              props={item.props}
            />
          ),
          avoidDefaultDomBehavior: true,
          toggle: (
            <div
              key={index}
              className={
                "d-flex gap-3 align-items-center justify-content-center user-select-none" +
                (index !== items.length - 1 ? " border-end" : "")
              }
            >
              <i className={item.icon} style={{ color: "#4498E0" }}></i>
              {item.count && <span>{item.count}</span>}
              <span>{item.title}</span>
            </div>
          ),
          toggleContainerProps: {
            className: "flex-fill"
          }
        }}
      />
    );
  };

  return (
    <div className="d-flex gap-4 justify-content-between mt-2 border-top pt-4 flex-wrap">
      {items.map(renderModal)}
    </div>
  );
}

const voted = {
  yes: checkVotesForCongressDao("Approve"),
  no: checkVotesForCongressDao("Reject"),
  spam: isVotingBodyDao
    ? checkVotesForCongressDao("Spam")
    : checkVotesForCongressDao("Remove"),
  abstain: checkVotesForCongressDao("Abstain")
};

const alreadyVoted = voted.yes || voted.no || voted.spam;

const canVote =
  isAllowedToVote.every((v) => v) &&
  statusName === "In Progress" &&
  !alreadyVoted;

const showMultiVote = multiSelectMode && canVote;

if (multiSelectMode && !canVote) {
  let reason = "";

  if (!isAllowedToVote.every((v) => v)) {
    reason = "you don't have permissions to vote";
  }
  if (statusName !== "In Progress") {
    reason = `it's already ${statusName}`;
  }
  if (alreadyVoted) {
    reason = ` you've already voted ${votes[accountId]}`;
  }

  return (
    <div>
      Hiding #{id} because {reason}
    </div>
  );
}

const NotificationModal = () => {
  return (
    <Widget
      src="/*__@appAccount__*//widget/Layout.Modal"
      props={{
        content: (
          <div className="ndc-card p-4">
            {/* sputnik dao proposal is expired */}
            {!isCongressDaoID &&
              !isVotingBodyDao &&
              new Date().getTime() > new Date(expirationTime).getTime() && (
                <div className="alert alert-info">
                  Please note: This proposal has expired. Your vote will only
                  mark the proposal as 'Expired' and won't affect the
                  decision-making process.
                </div>
              )}
            <div className="d-flex flex-column gap-3">
              Do you want to notify proposer: {proposer} about the vote?
              <div className="d-flex gap-3 justify-content-end">
                <Widget
                  src="nearui.near/widget/Input.Button"
                  props={{
                    children: <>No</>,
                    size: "sm",
                    variant: "danger outline",
                    onClick: () => {
                      handleVote({
                        action: voteDetails,
                        daoId,
                        proposalId: proposal.id,
                        proposer,
                        showNotification: false
                      });
                      setNotificationModal(false);
                    }
                  }}
                />
                <Widget
                  src="nearui.near/widget/Input.Button"
                  props={{
                    children: <>Yes</>,
                    variant: "info outline",
                    size: "sm",
                    onClick: () => {
                      handleVote({
                        action: voteDetails,
                        daoId,
                        proposalId: proposal.id,
                        proposer,
                        showNotification: true
                      });
                      setNotificationModal(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ),
        toggle: <></>,
        open: showNotificationModal,
        onOpenChange: () => setNotificationModal(!showNotificationModal)
      }}
    />
  );
};

const Content = useMemo(() => {
  return (
    <>
      {renderPermission({ isAllowedToVote: isAllowedToVote.every((v) => v) })}
      {renderHeader({ typeName, id, daoId, statusName })}
      {renderData({
        proposer,
        category,
        description,
        submission_time,
        totalVotesNeeded
      })}
      {!!showMultiVote &&
        renderMultiVoteButtons({
          daoId,
          proposal,
          canVote
        })}

      {statusName !== "Pre Vote" &&
        !showMultiVote &&
        renderVoteButtons({
          totalVotes,
          statusName,
          votes,
          accountId,
          isAllowedToVote,
          handleVote: (action) => {
            if (isVotingBodyDao) {
              return handleVote({
                action,
                daoId,
                proposalId: proposal.id,
                proposer
              });
            } else {
              setNotificationModal(true);
              setVoteDetails(action);
            }
          }
        })}

      {statusName === "Pre Vote" &&
        renderPreVoteButtons({
          proposal
        })}
    </>
  );
}, [proposal.id]);

return (
  <Wrapper className="ndc-card" status={statusName}>
    <NotificationModal />
    {Content}
    {renderFooter({
      totalVotes,
      votes,
      comments,
      daoId,
      proposal
    })}
  </Wrapper>
);
