const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId;
const onClose = props.onClose;
const registry = props.registry;

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

function convertHoursToMilliseconds(hours) {
  return hours * 60 * 60 * 1000;
}

function convertDaysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

State.init({
  pre_vote_hours: 0,
  pre_vote_days: 0,
  vote_hours: 0,
  vote_days: 0,
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
  if (isEmpty(state.pre_vote_hours) && isEmpty(state.pre_vote_days)) {
    State.update({
      error: "Please specify pre vote duration"
    });
    return;
  }
  if (isEmpty(state.vote_hours) && isEmpty(state.vote_days)) {
    State.update({
      error: "Please specify vote duration"
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
      UpdateVoteDuration: {
        vote_duration:
          convertHoursToMilliseconds(state.vote_hours) +
          convertDaysToMilliseconds(state.vote_days),
        pre_vote_duration:
          convertHoursToMilliseconds(state.pre_vote_hours) +
          convertDaysToMilliseconds(state.pre_vote_days)
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

const onChangePreVoteHours = (pre_vote_hours) => {
  State.update({
    pre_vote_hours,
    error: undefined
  });
};

const onChangePreVoteDays = (pre_vote_days) => {
  State.update({
    pre_vote_days,
    error: undefined
  });
};

const onChangeVoteHours = (vote_hours) => {
  State.update({
    vote_hours,
    error: undefined
  });
};

const onChangeVoteDays = (vote_days) => {
  State.update({
    vote_days,
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
      <h5>Pre Vote Duration</h5>
      <div className="d-flex gap-2">
        <input
          type="number"
          placeholder="Days"
          onChange={(e) => onChangePreVoteDays(e.target.value)}
        />
        <input
          type="number"
          placeholder="Hours"
          onChange={(e) => onChangePreVoteHours(e.target.value)}
        />
      </div>
    </div>
    <div className="mb-3">
      <h5>Vote Duration</h5>
      <div className="d-flex gap-2">
        <input
          type="number"
          placeholder="Days"
          onChange={(e) => onChangeVoteDays(e.target.value)}
        />
        <input
          type="number"
          placeholder="Hours"
          onChange={(e) => onChangeVoteHours(e.target.value)}
        />
      </div>
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
        proposalType: "Update Vote duration"
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
