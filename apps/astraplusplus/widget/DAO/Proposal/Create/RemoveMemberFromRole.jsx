const accountId = props.accountId ?? context.accountId;
const daoId = props.daoId ?? "multi.sputnik-dao.near";
const onClose = props.onClose;
const policy = props.daoPolicy;

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

State.init({
  member_id: state.member_id,
  role: state.role,
  error: undefined,
  rolesOptions: [],
  description: null,
  notificationsData: {}
});

function isNearAddress(address) {
  const ACCOUNT_ID_REGEX =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
  return (
    address.length >= 2 &&
    address.length <= 64 &&
    ACCOUNT_ID_REGEX.test(address)
  );
}

function isEmpty(value) {
  return !value || value === "";
}

if (policy === null) {
  return <></>;
}

const processPolicy = (policy) => {
  const roles = {};
  const options = [];
  policy.roles.forEach((role) => {
    if (role.kind.Group) {
      if (!roles[role.name]) {
        roles[role.name] = role;
        options.push({ text: role.name, value: role.name });
      }
    }
  });
  State.update({ rolesOptions: options });
  return roles;
};

const allowedRoles = processPolicy(policy);

const handleProposal = () => {
  if (isEmpty(state.description)) {
    State.update({
      error: "Please enter a description"
    });
    return;
  }
  if (
    !state.member_id ||
    state.member_id === "" ||
    !isNearAddress(state.member_id)
  ) {
    State.update({
      error: "Please enter a valid member ID"
    });
    return;
  }
  if (!state.role || state.role === "") {
    State.update({
      error: "Please enter a valid role"
    });
    return;
  }

  const gas = 200000000000000;
  const deposit = policy?.proposal_bond || 100000000000000000000000;
  const calls = [
    {
      contractName: daoId,
      methodName: "add_proposal",
      args: {
        proposal: {
          description: state.description,
          kind: {
            RemoveMemberFromRole: {
              member_id: state.member_id ?? accountId,
              role: state.role ?? "council"
            }
          }
        }
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

const onChangeMember = (member_id) => {
  State.update({
    member_id,
    error: undefined
  });
};

const onChangeRole = (role) => {
  State.update({
    role,
    error: undefined
  });
};

const onChangeDescription = (description) => {
  State.update({
    description,
    error: undefined
  });
};

const defaultDescription = "Remove member";

return (
  <>
    <div className="mb-3">
      <h5>Account ID</h5>
      <Widget
        src={
          "/*__@appAccount__*//widget/DAO.Proposal.Common.AccountAutoComplete"
        }
        props={{
          placeholder: "Specify member account",
          accountId: state.member_id,
          onChange: onChangeMember
        }}
      />
    </div>
    <div className="mb-3">
      <Widget
        src={`/*__@appAccount__*//widget/Common.Components.Select`}
        props={{
          label: "Role",
          noLabel: false,
          placeholder: "Select the role",
          options: state.rolesOptions,
          value: { text: state.role, value: state.role },
          onChange: (role) => {
            onChangeRole(role.value);
          },
          error: undefined
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
        proposalType: "Remove Member From Role"
      }}
    />
    {state.error && <div className="text-danger">{state.error}</div>}
    <div className="ms-auto">
      <Widget
        src="/*__@appAccount__*//widget/Common.Components.Button"
        props={{
          children: "Propose To Remove Member",
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
