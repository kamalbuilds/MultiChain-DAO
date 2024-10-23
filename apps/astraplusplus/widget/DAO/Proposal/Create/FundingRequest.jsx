const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId ?? "multi.sputnik-dao.near";
const onClose = props.onClose;
const proposalType = props.proposalType;

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

State.init({
  description: null,
  fundingAmt: null,
  error: null,
  notificationsData: {}
});

const handleProposal = () => {
  if (!state.description) {
    State.update({
      error: "Please enter a description"
    });
    return;
  }
  if (!state.fundingAmt) {
    State.update({
      error: "Please enter an amount"
    });
    return;
  }

  const gas = 20000000000000;
  const deposit = 100000000000000000000000;
  const amount = Big(state.fundingAmt).mul(Big(10).pow(24)).toFixed();
  const calls = [
    {
      contractName: daoId,
      methodName: "create_proposal",
      args: {
        description: state.description,
        kind: { [proposalType]: amount }
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

const onChangeDescription = (description) => {
  State.update({
    description,
    error: undefined
  });
};

const onChangeAmount = (amt) => {
  State.update({
    fundingAmt: amt,
    error: undefined
  });
};

const defaultDescription =
  "### [Your Title Here]\n\n#### Description\n\n[Detailed description of what the proposal is about.]\n\n#### Why This Proposal?\n\n[Explanation of why this proposal is necessary or beneficial.]\n\n#### Execution Plan\n\n[Description of how the proposal will be implemented.]\n\n#### Budget\n\n[If applicable, outline the budget required to execute this proposal.]\n\n#### Timeline\n\n[Proposed timeline for the execution of the proposal.]";

return (
  <>
    <div className="mb-3">
      <h5>Amount (NEAR)</h5>
      <input
        type="number"
        onChange={(e) => onChangeAmount(e.target.value)}
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
        proposalType: "Funding request"
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
