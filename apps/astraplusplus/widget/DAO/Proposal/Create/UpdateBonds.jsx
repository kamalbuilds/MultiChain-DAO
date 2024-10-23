const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId;
const onClose = props.onClose;
const registry = props.registry;

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

State.init({
  pre_vote_bond: 0,
  active_queue_bond: 0,
  error: null,
  attachDeposit: 0,
  proposalQueue: null,
  description: null,
  notificationsData: {}
});

function isEmpty(value) {
  return !value || value === "";
}

const handleProposal = () => {
  if (isEmpty(state.active_queue_bond)) {
    State.update({
      error: "Please add active queue bond amount"
    });
    return;
  }
  if (isEmpty(state.pre_vote_bond)) {
    State.update({
      error: "Please add pre vote bond amount"
    });
    return;
  }

  if (isEmpty(state.description)) {
    State.update({
      error: "Please enter a description"
    });
    return;
  }

  const gas = 20000000000000;
  const deposit = state.attachDeposit
    ? Big(state.attachDeposit)
    : 100000000000000000000000;

  const preVoteBond = Big(state.pre_vote_bond).mul(Big(10).pow(24)).toFixed();
  const activeBond = Big(state.active_queue_bond)
    .mul(Big(10).pow(24))
    .toFixed();

  const args = JSON.stringify({
    description: state.description,
    kind: {
      UpdateBonds: {
        pre_vote_bond: preVoteBond,
        active_queue_bond: activeBond
      }
    },
    caller: accountId
  });

  const calls = [
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
  ];
  if (state.notificationsData) {
    calls.push(state.notificationsData);
  }

  Near.call(calls);
};

const onChangePreVoteBond = (pre_vote_bond) => {
  State.update({
    pre_vote_bond,
    error: undefined
  });
};

const onChangeActiveQueueBond = (active_queue_bond) => {
  State.update({
    active_queue_bond,
    error: undefined
  });
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
    <Widget
      src="/*__@appAccount__*//widget/DAO.Proposal.Common.ProposalQueue"
      props={{
        daoId: daoId,
        onUpdate: onChangeQueue,
        dev: props.dev
      }}
    />

    <div className="mb-3">
      <h5>Pre Vote Bond amount (NEAR)</h5>
      <input
        type="number"
        onChange={(e) => onChangePreVoteBond(e.target.value)}
      />
    </div>
    <div className="mb-3">
      <h5>Active Queue Bond amount (NEAR)</h5>
      <input
        type="number"
        onChange={(e) => onChangeActiveQueueBond(e.target.value)}
      />
    </div>
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
        proposalType: "Update Bonds"
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
