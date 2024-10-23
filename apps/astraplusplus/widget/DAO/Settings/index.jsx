const widgetOwner = props.widgetOwner ?? "/*__@appAccount__*/";
const daoId = props.daoId;
const Wrapper = styled.div`
  p {
    font-size: 13px;
  }
  .text-subdued {
    color: rgba(130, 134, 136, 1);
  }

  .no-card-div {
    .ndc-card {
      all: unset;
    }
  }
`;
const accountId = context.accountId;
const policy = Near.view(daoId, "get_policy");
const config = Near.view(daoId, "get_config");

if (policy === null || config === null) {
  return <Widget src="nearui.near/widget/Feedback.Spinner" />;
}

const metadata = JSON.parse(atob(config.metadata ?? ""));

State.init({
  tab: "Configuration",
  answers: initialAnswers,
  form: {
    ...config,
    policy: policy,
    ...metadata
  }
});

const currentUserRoles = []; // can have mutliple roles

state.form?.policy?.roles?.map((role) => {
  if (
    Array.isArray(role?.kind?.Group) &&
    role?.kind?.Group?.includes(accountId)
  ) {
    currentUserRoles.push(role.name);
  }
});

// checks if user has permission to make edits to the screen
const hasPermission = (proposalKind) => {
  const permissions = currentUserRoles.map((role) => {
    const roleObj = state.form.policy.roles.find((r) => r.name === role);
    if (roleObj) {
      return (
        roleObj.permissions.includes(`${proposalKind}:*`) ||
        roleObj.permissions.includes("*:*") ||
        roleObj.permissions.includes(`${proposalKind}:AddProposal`)
      );
    } else {
      return false;
    }
  });
  return permissions.some((element) => element === true);
};

const tabs = {
  Configuration: {
    name: "Configuration",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/DAO.Settings.ConfigSettings`}
        props={{
          ...props,
          formState: state.form,
          hasPermission: hasPermission("config")
        }}
      />
    )
  },
  Policy: {
    name: "Policy",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/DAO.Settings.PolicySettings`}
        props={{
          ...props,
          formState: state.form,
          hasPermission: hasPermission("policy")
        }}
      />
    )
  },
  Bonds: {
    name: "Bonds and Deadlines",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/DAO.Settings.BondsSettings`}
        props={{
          ...props,
          formState: state.form,
          hasPermission: hasPermission("policy")
        }}
      />
    )
  }
};

const tabContent = tabs[state.tab].component;

return (
  <Wrapper>
    <div className="mt-4">
      <div className="ndc-card p-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <h3
            className="pb-2 fw-bold"
            style={{
              flex: 1,
              borderBottom: "1px solid rgb(236, 238, 240)",
              marginBottom: "18px",
              minWidth: "200px"
            }}
          >
            DAO settings
          </h3>
          <div className="no-card-div">
            <Widget
              src={`${widgetOwner}/widget/DAO.Layout.Tabs`}
              props={{
                tabs: tabs,
                tab: state.tab,
                update: (state) => State.update(state),
                allowHref: false
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: "-30px" }}>{tabContent}</div>
      </div>
    </div>
  </Wrapper>
);
