const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId ?? "multi.sputnik-dao.near";
const onClose = props.onClose;
const powerType = props.powerType;
const isCongressDaoID = props.isCongressDaoID;
const isVotingBodyDao = props.isVotingBodyDao;
const registry = props.registry;
const kind = props.kind;
const policy = props.daoPolicy;

const HoMDaoId = props.dev
  ? "/*__@replace:HoMDaoIdTesting__*/"
  : "/*__@replace:HoMDaoId__*/";

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

State.init({
  description: state.description,
  error: state.error,
  attachDeposit: 0,
  proposalQueue: null,
  notificationsData: {}
});

const handleProposal = () => {
  if (!state.description) {
    State.update({
      error: "Please enter a description"
    });
    return;
  }
  const gas = 200000000000000;
  const deposit = state.attachDeposit
    ? Big(state.attachDeposit)
    : 100000000000000000000000;
  const args = isCongressDaoID
    ? {
        description: state.description,
        kind: "Text"
      }
    : {
        proposal: {
          description: state.description,
          kind: "Vote"
        }
      };
  if (isVotingBodyDao) {
    const args = JSON.stringify({
      description: state.description,
      kind: kind,
      caller: accountId
    });

    if (!state.proposalQueue) {
      State.update({
        error: "Please select proposal queue"
      });
      return;
    }

    Near.call([
      {
        contractName: registry,
        methodName: "is_human_call",
        args: {
          ctr: daoId,
          function: "create_proposal",
          payload: args
        },
        gas: gas,
        deposit: deposit
      }
    ]);
  } else {
    const calls = [
      {
        contractName: daoId,
        methodName:
          isCongressDaoID || isVotingBodyDao
            ? "create_proposal"
            : "add_proposal",
        args: args,
        gas: gas,
        deposit: policy?.proposal_bond || 100000000000000000000000
      }
    ];
    if (state.notificationsData) {
      calls.push(state.notificationsData);
    }

    Near.call(calls);
  }
};

const onChangeDescription = (description) => {
  State.update({
    description,
    error: undefined
  });
};

const onChangeQueue = ({ amount, queue }) => {
  State.update({
    attachDeposit: amount,
    proposalQueue: queue
  });
};

const defaultDescription =
  "### [Your Title Here]\n\n#### Description\n\n[Detailed description of what the proposal is about.]\n\n#### Why This Proposal?\n\n[Explanation of why this proposal is necessary or beneficial.]\n\n#### Execution Plan\n\n[Description of how the proposal will be implemented.]\n\n#### Budget\n\n[If applicable, outline the budget required to execute this proposal.]\n\n#### Timeline\n\n[Proposed timeline for the execution of the proposal.]";

return (
  <>
    {isVotingBodyDao && (
      <div className="mb-3">
        This proposal requires
        <a
          href={`https://github.com/near-ndc/voting-v1/blob/master/voting_body/README.md?#quorums-and-thresholds`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgb(68, 152, 224)" }}
        >
          Near {kind === "TextSuper" && " Super"} Consent.
        </a>
      </div>
    )}
    <Widget
      src="/*__@appAccount__*//widget/DAO.Proposal.Common.ProposalQueue"
      props={{
        daoId: daoId,
        onUpdate: onChangeQueue,
        dev: props.dev
      }}
    />
    <div className="mb-3">
      <h5>Proposal Description</h5>
      <Widget
        src={"devhub.near/widget/devhub.components.molecule.Compose"}
        props={{
          data: state.description,
          onChange: onChangeDescription,
          autocompleteEnabled: true,
          autoFocus: false,
          placeholder: defaultDescription
        }}
      />
    </div>
    <Widget
      src="/*__@appAccount__*//widget/DAO.Proposal.Common.NotificationRolesSelector"
      props={{
        daoId: daoId,
        dev: props.dev,
        onUpdate: (v) => {
          State.update({ notificationsData: v });
        },
        proposalType: "Text"
      }}
    />
    {state.error && <div className="text-danger">{state.error}</div>}
    <div className="ms-auto">
      <Widget
        src="/*__@appAccount__*//widget/Common.Components.Button"
        props={{
          children: "Create Proposal",
          onClick: handleProposal,
          className: "mt-2",
          variant: "success"
        }}
      />
      {onClose && (
        <Widget
          src="/*__@appAccount__*//widget/Common.Components.Button"
          props={{
            children: "Close",
            onClick: onClose,
            className: "mt-2"
          }}
        />
      )}
    </div>
  </>
);
