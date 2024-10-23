const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId;
const onClose = props.onClose;
const registry = props.registry;

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

function isEmpty(value) {
  return !value || value === "";
}

function isNearAddress(address) {
  const ACCOUNT_ID_REGEX =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
  return (
    address.length >= 2 &&
    address.length <= 64 &&
    ACCOUNT_ID_REGEX.test(address)
  );
}

State.init({
  prop_id: null, // proposal id
  error: null,
  dao: null,
  attachDeposit: 0,
  proposalQueue: null,
  description: null,
  notificationsData: {}
});

const handleProposal = () => {
  if (isEmpty(state.dao) || !isNearAddress(state.dao)) {
    State.update({
      error: "Please select an house"
    });
    return;
  }

  if (isEmpty(state.prop_id)) {
    State.update({
      error: "Please enter a proposal ID"
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

  const args = JSON.stringify({
    description: state.description,
    kind: {
      ApproveBudget: { prop_id: parseInt(state.prop_id), dao: state.dao }
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

const onChangePropID = (prop_id) => {
  State.update({
    prop_id,
    error: undefined
  });
};

const onChangeDescription = (description) => {
  State.update({
    description,
    error: undefined
  });
};

const onChangeDao = (dao) => {
  State.update({
    dao,
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

    <Widget
      src="/*__@appAccount__*//widget/DAO.Proposal.Common.CongressHouseDropdown"
      props={{
        daoId: daoId,
        label: "House",
        placeholder: "Select house account",
        onUpdate: onChangeDao
      }}
    />
    <div className="mb-3">
      <h5>Proposal ID</h5>
      <input
        type="number"
        onChange={(e) => onChangePropID(e.target.value)}
        min="0"
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
        proposalType: "Approve Budget"
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
