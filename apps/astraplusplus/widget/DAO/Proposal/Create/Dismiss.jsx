const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId;
const onClose = props.onClose;
const registry = props.registry;
const isHookCall = props.isHookCall;

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

State.init({
  dao: null,
  member: null,
  error: null,
  attachDeposit: 0,
  proposalQueue: null,
  description: null,
  notificationsData: {}
});

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

const handleProposal = () => {
  let error;
  let args;
  const gas = 20000000000000;
  const deposit = state.attachDeposit
    ? Big(state.attachDeposit)
    : 100000000000000000000000;

  if (!isHookCall) {
    if (isEmpty(state.dao) || !isNearAddress(state.dao))
      error = "Please select a house";
    if (isEmpty(state.member) || !isNearAddress(state.member))
      error = "Please enter a valid member ID";
    if (isEmpty(state.description)) error = "Please enter a description";
    if (!state.proposalQueue) error = "Please select proposal queue";

    if (error) {
      State.update({ error });
      return;
    }
  }
  const calls = [];
  if (isHookCall) {
    const fc_args = Buffer.from(
      JSON.stringify({ member: state.member }),
      "utf-8"
    ).toString("base64");

    args = {
      kind: {
        FunctionCall: {
          receiver_id: state.dao,
          actions: [
            {
              method_name: "dismiss_hook",
              args: fc_args,
              gas: "50000000000000",
              deposit: "0"
            }
          ]
        }
      },
      description: state.description
    };
    calls.push({
      contractName: daoId,
      methodName: "create_proposal",
      args: args,
      deposit: 100000000000000000000000,
      gas: 200000000000000
    });
  } else {
    const args = JSON.stringify({
      description: state.description,
      kind: { Dismiss: { dao: state.dao, member: state.member } },
      caller: accountId
    });

    calls.push({
      contractName: registry,
      methodName: "is_human_call",
      args: {
        ctr: daoId,
        function: "create_proposal",
        payload: args
      },
      gas: gas,
      deposit: deposit
    });
  }
  if (state.notificationsData) {
    calls.push(state.notificationsData);
  }

  Near.call(calls);
};

const onChangeDao = (dao) => {
  State.update({
    dao,
    error: undefined
  });
};

const onChangeMember = (member) => {
  State.update({
    member,
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
    {!isHookCall && (
      <Widget
        src="/*__@appAccount__*//widget/DAO.Proposal.Common.ProposalQueue"
        props={{
          daoId: daoId,
          onUpdate: onChangeQueue,
          dev: props.dev
        }}
      />
    )}
    <Widget
      src="/*__@appAccount__*//widget/DAO.Proposal.Common.CongressHouseDropdown"
      props={{
        daoId: daoId,
        label: "House",
        placeholder: "Select house account",
        onUpdate: onChangeDao,
        dev: props.dev
      }}
    />
    <div className="mb-3">
      <h5>Member</h5>
      <Widget
        src={
          "/*__@appAccount__*//widget/DAO.Proposal.Common.AccountAutoComplete"
        }
        props={{
          placeholder: "Specify member account",
          accountId: state.member,
          onChange: onChangeMember
        }}
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
        proposalType: "Dismiss"
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
