const {
  formState,
  errors,
  renderFooter,
  showSteps,
  isConfigScreen,
  updateParentState
} = props;
const { accountId } = context;

updateParentState || (updateParentState = () => {});

const initialAnswers = {
  policy: formState.policy
};

const [showAccountAutocompleteIndex, setShowAccountAutocompleteIndex] =
  useState(null);

function isNearAddress(address) {
  const ACCOUNT_ID_REGEX =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
  return (
    address.length >= 2 &&
    address.length <= 64 &&
    ACCOUNT_ID_REGEX.test(address)
  );
}

// not using formState because, the formState doesn't match the ui state

const initialMembers = [];

for (const role of initialAnswers.policy.roles) {
  if (!role.kind.Group) continue;
  for (const member of role.kind.Group) {
    initialMembers.push({
      role: role.name,
      name: member
    });
  }
}

const initialState = {
  roles: initialAnswers.policy.roles.length
    ? initialAnswers.policy.roles.map((r) => r.name)
    : ["council", "all"],
  members: initialMembers.length
    ? initialMembers
    : [{ role: "council", name: accountId }]
};

State.init({
  answers: initialState,
  error: null
});

// -- roles
const onAddEmptyRole = () => {
  State.update({
    answers: {
      ...state.answers,
      roles: [...state.answers.roles, ""]
    }
  });
};

const onRemoveRole = (index) => {
  State.update({
    answers: {
      ...state.answers,
      roles: state.answers.roles.filter((role, i) => i !== index)
    }
  });
};

const onSetRoleName = (index, name) => {
  State.update({
    answers: {
      ...state.answers,
      roles: state.answers.roles.map((role, i) => (i === index ? name : role))
    }
  });
};

// -- members
const onAddEmptyMember = () => {
  setShowAccountAutocompleteIndex(null);
  State.update({
    answers: {
      ...state.answers,
      members: [
        ...state.answers.members,
        { name: "", role: state.answers.roles.filter((i) => i !== "all")[0] }
      ]
    }
  });
};

const onRemoveMember = (index) => {
  setShowAccountAutocompleteIndex(null);
  State.update({
    answers: {
      ...state.answers,
      members: state.answers.members.filter((member, i) => i !== index)
    }
  });
};

const onSetMemberName = (index, name) => {
  if (!isNearAddress(name)) {
    State.update({
      error: { [index]: "Please add a valid near address." }
    });
  } else {
    State.update({
      error: null
    });
  }
  State.update({
    answers: {
      ...state.answers,
      members: state.answers.members.map((member, i) =>
        i === index ? { ...member, name } : member
      )
    }
  });
};

const onSetMemberRole = (index, role) => {
  State.update({
    answers: {
      ...state.answers,
      members: state.answers.members.map((member, i) =>
        i === index ? { ...member, role } : member
      )
    }
  });
};

// Make the state back to formState format
const finalState = {
  policy: {
    ...formState.policy,
    roles: state.answers.roles
      .filter((role, i) => role !== null && role !== "")
      .map((role, i) => {
        if (role === "all")
          return {
            name: role,
            permissions: formState.policy.roles[i]?.permissions ?? [],
            kind: "Everyone",
            vote_policy: formState.policy.roles[i]?.vote_policy || {}
          };
        return {
          name: role,
          kind: {
            Group: state.answers.members
              .filter((m) => m.role === role && m !== null && m.name !== "")
              .map((m) => m.name)
          },
          permissions: isConfigScreen
            ? formState.policy.roles[i].permissions ?? []
            : formState.policy.roles[i]?.permissions || role === "council"
            ? ["*:*"]
            : [],
          vote_policy: formState.policy.roles[i]?.vote_policy || {}
        };
      })
  }
};

useEffect(() => {
  let timeoutId;

  // Debounced function to update parent state
  const debouncedUpdate = (value) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateParentState(value);
    }, 300); // Adjust the debounce delay as needed
  };

  // Call the debounced function when local value changes
  debouncedUpdate(finalState);

  return () => {
    // Cleanup on unmount
    clearTimeout(timeoutId);
  };
}, [state.answers]);

const Container = styled.div`
  .flex-1 {
    flex: 1;
  }
`;

return (
  <Container className="mt-4 ndc-card p-4">
    <div className="d-flex flex-column gap-2">
      {showSteps && (
        <h2 className="h5 fw-bold">
          <span
            className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bolder h5 me-2"
            style={{
              width: "48px",
              height: "48px",
              border: "1px solid #82E299"
            }}
          >
            4
          </span>
          Add Groups & Members
        </h2>
      )}
      <div className="mb-3">
        <div className="d-flex gap-2 justify-content-between">
          <div>
            <h3 className="h6 fw-bold">Add Groups</h3>
            <p className="text-black-50 fw-light small">
              You can add members and assign them various roles, with
              permissions customizable in the next step. The 'All' group
              includes everyone; you can remove it if you wish to limit
              interactions to selected individuals within your DAO.
            </p>
          </div>
          <Widget
            src="nearui.near/widget/Input.Button"
            props={{
              children: <i className="bi bi-plus-lg" />,
              variant: "icon info outline",
              size: "lg",
              onClick: onAddEmptyRole
            }}
          />
        </div>
        {state.answers.roles.map((r, i) => (
          <div
            className={[
              "d-flex align-items-center gap-2 mt-2",
              r === null ? "d-none" : ""
            ].join(" ")}
            key={i}
          >
            <Widget
              src="nearui.near/widget/Input.ExperimentalText"
              props={{
                placeholder: "Group 1",
                size: "lg",
                disabled: !isConfigScreen && i < 1,
                value: r,
                onChange: (v) => onSetRoleName(i, v),
                error:
                  errors.policy.roles[
                    finalState.policy.roles.findIndex((role) => role.name === r)
                  ].name,
                inputProps: { defaultValue: r }
              }}
            />
            {(isConfigScreen ? state.answers.roles.length > 1 : i >= 1) && (
              <Widget
                src="nearui.near/widget/Input.Button"
                props={{
                  children: <i className="bi bi-trash" />,
                  variant: "icon danger outline",
                  size: "lg",
                  onClick: () => onRemoveRole(i)
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="d-flex gap-2 justify-content-between">
          <div>
            <h3 className="h6 fw-bold">Add Members</h3>
            <p className="text-black-50 fw-light small">
              Add members to the DAO and set their{" "}
              <a
                href=""
                target="_blank"
                style={{
                  color: "#4498E0"
                }}
              >
                roles
              </a>
              .
            </p>
          </div>
          <Widget
            src="nearui.near/widget/Input.Button"
            props={{
              children: <i className="bi bi-plus-lg" />,
              variant: "icon info outline",
              size: "lg",
              onClick: onAddEmptyMember
            }}
          />
        </div>

        {state.answers.members.map((member, i) => {
          const trueRoleIndex =
            member !== null &&
            finalState.policy.roles.findIndex(
              (role) => role.name === member.role
            );
          const trueMemberIndex =
            member !== null &&
            trueRoleIndex !== -1 &&
            typeof finalState.policy.roles[trueRoleIndex].kind === "object"
              ? finalState.policy.roles[trueRoleIndex].kind.Group.findIndex(
                  (m) => m === member.name
                )
              : null;

          return (
            <div
              className={[
                "d-flex gap-2 mt-2",
                member === null ? "d-none" : ""
              ].join(" ")}
              key={i}
            >
              <div className="d-flex flex-column gap-2 flex-1">
                <Widget
                  src="nearui.near/widget/Input.ExperimentalText"
                  props={{
                    placeholder: "user.near",
                    size: "lg",
                    value: member.name,
                    onChange: (v) => {
                      if (showAccountAutocompleteIndex !== i) {
                        setShowAccountAutocompleteIndex(i);
                      }
                      onSetMemberName(i, v);
                    },
                    disabled: !isConfigScreen && i === 0,
                    error:
                      state.error[i] ||
                      (trueMemberIndex !== null &&
                        errors.policy.roles[trueRoleIndex].kind.Group[
                          trueMemberIndex
                        ])
                  }}
                />
                {showAccountAutocompleteIndex === i && (
                  <Widget
                    src="devhub.near/widget/devhub.components.molecule.AccountAutocomplete"
                    props={{
                      term: member.name,
                      onSelect: (v) => {
                        onSetMemberName(i, v);
                        setShowAccountAutocompleteIndex(null);
                      },
                      onClose: () => setShowAccountAutocompleteIndex(null)
                    }}
                  />
                )}
              </div>
              <div className="flex-1">
                <Widget
                  src="nearui.near/widget/Input.Select"
                  props={{
                    placeholder: "Role",
                    size: "lg",
                    options: state.answers.roles
                      .filter((r) => r !== null && r !== "" && r !== "all")
                      .map((r) => ({
                        title: r,
                        value: r
                      })),
                    value: member.role,
                    onChange: (v) => onSetMemberRole(i, v),
                    disabled: !isConfigScreen && i === 0
                  }}
                />
              </div>
              {(isConfigScreen ? state.answers.members.length > 1 : i >= 1) && (
                <Widget
                  src="nearui.near/widget/Input.Button"
                  props={{
                    children: <i className="bi bi-trash" />,
                    variant: "icon danger outline",
                    size: "lg",
                    onClick: () => onRemoveMember(i)
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>

    {renderFooter(finalState)}
  </Container>
);
