const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId;
const isHookCall = props.isHookCall;
const onClose = props.onClose;
const registry = props.registry;
const HoMDaoId = props.dev
  ? "/*__@replace:HoMDaoIdTesting__*/"
  : "/*__@replace:HoMDaoId__*/";
const house = props.house;
const proposalID = props.proposalID;
const description = props.description;

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
  prop_id: proposalID, // proposal id
  dao: house,
  error: null,
  attachDeposit: 0,
  proposalQueue: null,
  description: description ?? "",
  notificationsData: {}
});

const handleProposal = () => {
  let error;
  let args;
  const gas = 20000000000000;
  const deposit = state.attachDeposit
    ? Big(state.attachDeposit)
    : 100000000000000000000000;

  if (!isHookCall) {
    if (isEmpty(state.dao) || !isNearAddress(state.dao))
      error = "Please enter a valid DAO ID";
    if (isEmpty(state.prop_id)) error = "Please enter a proposal ID";
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
      JSON.stringify({ id: parseInt(state.prop_id) }),
      "utf-8"
    ).toString("base64");

    args = {
      kind: {
        FunctionCall: {
          receiver_id: HoMDaoId,
          actions: [
            {
              method_name: "veto_hook",
              args: fc_args,
              deposit: "100000000000000000000000",
              gas: "50000000000000"
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
    args = JSON.stringify({
      description: state.description,
      kind: {
        Veto: {
          prop_id: parseInt(state.prop_id),
          dao: state.dao
        }
      },
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

const onChangePropID = (prop_id) => {
  State.update({
    prop_id,
    error: undefined
  });
};

const onChangeDao = (dao) => {
  State.update({
    dao,
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
    {!props.isHookCall && (
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
            house: state.dao,
            label: "House",
            placeholder: "Select house account",
            onUpdate: onChangeDao,
            dev: props.dev
          }}
        />
      </>
    )}
    <div className="mb-3">
      <h5>Proposal ID</h5>
      <input
        type="number"
        value={state.prop_id}
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
        proposalType: "Veto"
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
