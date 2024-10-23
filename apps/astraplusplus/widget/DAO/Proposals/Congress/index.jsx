const daoId = props.daoId;
const resPerPage = 5;

const constructURL = (paramObj, base) => {
  paramObj = { ...paramObj, page: "dao" };
  const baseURL = base ?? `#/${widgetOwner}/widget/home`;
  let params = "";
  for (const [key, value] of Object.entries(paramObj)) {
    params += `${key}=${value}&`;
  }
  params = params.slice(0, -1);
  return `${baseURL}?${params}`;
};

const VotingBodyDaoId = props.dev
  ? "/*__@replace:VotingBodyDaoIdTesting__*/"
  : "/*__@replace:VotingBodyDaoId__*/";

const isVotingBodyDao = daoId === VotingBodyDaoId;

State.init({
  daoId,
  daos: [daoId],
  page: 0,
  filters: {
    proposal_types: [],
    status: [],
    time_start: "",
    time_end: ""
  },
  filtersOpen: false,
  proposals: [],
  proposalsCount: 0,
  daoConfig
});

const execProposal = (proposal) =>
  Near.call(daoId, "execute", { id: proposal.id }, 150000000000000);

const Wrapper = styled.div`
  .border-bottom {
    border-bottom: 1px solid #eee;
  }

  .text-center {
    text-align: center;
  }

  .text-wrap {
    text-wrap: wrap;
  }

  .bold {
    font-weight: 600;
  }
`;

const ProposalCard = styled.div`
  .type {
    line-height: 18px;
    width: 370px;

    @media (max-width: 768px) {
      width: 300px;
    }
  }

  .created_at {
    font-size: 11px;
  }
`;

function RenderHeader({ proposal }) {
  const statusName = proposal.status.replace(/([A-Z])/g, " $1").trim();
  const kindName =
    typeof proposal.kind === "string"
      ? proposal.kind
      : Object.keys(proposal.kind)[0];

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
    <div className="d-flex flex-wrap gap-2 mb-2">
      <Widget
        src="/*__@replace:nui__*//widget/Element.Badge"
        props={{
          children: `#${proposal.id}`,
          variant: `outline info round`,
          size: "md"
        }}
      />
      <Widget
        src="/*__@replace:nui__*//widget/Element.Badge"
        props={{
          children: (
            <>
              {proposal.kind.FunctionCall ? (
                <>
                  <span className="font-monospace">
                    {proposal.kind.FunctionCall.actions
                      .map((a) => a.method_name)
                      .join(",")}
                  </span>
                </>
              ) : (
                <>{kindName}</>
              )}
            </>
          ),
          variant: `disabled round`
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
                  fontSize: "14px",
                  marginRight: "5px",
                  borderWidth: "2px",
                  animationDuration: "8s"
                }}
              ></i>
              {statustext}
            </>
          ),
          variant: `${statusvariant} round`
        }}
      />
    </div>
  );
}

const proposalsCount = Near.view(daoId, "number_of_proposals");
if (isVotingBodyDao) {
  const proposals = Near.view(daoId, "get_proposals", {
    from_index: 0,
    limit: resPerPage
  });
  State.update({
    proposals: proposals ?? [],
    proposalsCount: proposalsCount ?? 0
  });
} else {
  const proposals = Near.view(daoId, "get_proposals", {
    from_index: proposalsCount,
    limit: resPerPage,
    reverse: true
  });
  State.update({
    proposals: proposals ?? [],
    proposalsCount: proposalsCount ?? 0
  });
}

function getDaoConfig() {
  const daoConfig = Near.view(daoId, "config", {});
  State.update({ daoConfig });
}

getDaoConfig();

return (
  <Wrapper>
    <div>
      {isVotingBodyDao && (
        <h6 className="mb-2 bold">Active Queue Proposals:</h6>
      )}
      {state.proposals.map((proposal) => {
        if (!proposal.submission_time) {
          proposal.submission_time = proposal.start;
        }
        if (proposal.status === "Removed") return <></>;

        return (
          <ProposalCard className="d-flex py-3 justify-content-between border-bottom align-items-center">
            <div className="d-flex flex-column">
              <RenderHeader proposal={proposal} />
              <div class="text-truncate type w-90">{proposal.description}</div>
              <div className="created_at text-secondary d-flex gap-2">
                <div className="gap-1 d-flex">
                  <i className="bi bi-clock" />
                  <span>
                    {new Date(proposal.submission_time).toLocaleString()}
                  </span>
                </div>
                <div>|</div>
                {isVotingBodyDao ? (
                  <div>
                    {proposal.approve +
                      proposal.reject +
                      proposal.abstain +
                      proposal.spam}{" "}
                    votes
                  </div>
                ) : (
                  <div>
                    {Object.keys(proposal.votes ?? {}).length}{" "}
                    {Object.keys(proposal.votes ?? {}).length === 1
                      ? "vote"
                      : "votes"}
                  </div>
                )}
              </div>
            </div>
            <div className="d-flex gap-2">
              {proposal.status === "Approved" &&
                proposal?.submission_time +
                  (state.daoConfig?.vote_duration ??
                    state.daoConfig?.voting_duration) +
                  (state.daoConfig?.cooldown ?? 0) < // cooldown is not available in vb
                  Date.now() && (
                  <Widget
                    src="nearui.near/widget/Input.Button"
                    props={{
                      variant: "primary icon",
                      children: <i class="bi bi-play-fill" />,
                      onClick: () => execProposal(proposal)
                    }}
                  />
                )}
              <Widget
                src="/*__@appAccount__*//widget/Layout.Modal"
                props={{
                  toggle: (
                    <Widget
                      src="/*__@replace:nui__*//widget/Input.Button"
                      props={{
                        variant: "info outline icon",
                        children: <i class="bi bi-eye" />
                      }}
                    />
                  ),
                  content: (
                    <div
                      style={{
                        width: 700,
                        maxWidth: "100%"
                      }}
                    >
                      <Widget
                        src="astraplusplus.ndctools.near/widget/DAO.Proposals.Card.index"
                        props={{
                          daoId: daoId,
                          proposalString: JSON.stringify({
                            ...proposal,
                            votes: proposal.votes ?? {},
                            vote_counts: {}
                          }),
                          multiSelectMode: false,
                          isCongressDaoID: true,
                          isVotingBodyDao,
                          dev: props.dev
                        }}
                      />
                    </div>
                  )
                }}
              />
            </div>
          </ProposalCard>
        );
      })}
      <div className="mt-4 d-flex justify-content-center">
        <Widget
          src="/*__@replace:nui__*//widget/Input.Button"
          props={{
            variant: "info",
            size: "sm",
            children: (
              <a
                href={`#//*__@appAccount__*//widget/home?page=dao&daoId=${daoId}${
                  props.dev && "&dev=true"
                }`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "white" }}
              >
                View All Proposals
              </a>
            )
          }}
        />
      </div>
    </div>
  </Wrapper>
);
