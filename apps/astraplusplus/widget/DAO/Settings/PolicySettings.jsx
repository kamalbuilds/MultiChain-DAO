const { formState, hasPermission, daoId } = props;

const [policyState, setPolicyState] = useState(formState);
const [selectedTab, setSelectedTab] = useState("Groups");

const handleProposal = () => {
  const deposit = formState.policy.proposal_bond;
  const gas = 200000000000000;

  Near.call([
    {
      contractName: daoId,
      methodName: "add_proposal",
      args: {
        proposal: {
          description: "Update policy",
          kind: {
            ChangePolicy: policyState
          }
        }
      },
      gas: gas,
      deposit: deposit
    }
  ]);
};

const Footer = () => {
  return (
    <div className="d-flex justify-content-end mt-4">
      <Widget
        src="nearui.near/widget/Input.Button"
        props={{
          children: (
            <>
              <i class="bi bi-check-lg"></i> Propose changes
            </>
          ),
          variant: "info " + (!hasPermission && "disabled"),
          size: "lg",
          onClick: () => handleProposal(),
          buttonProps: {
            type: "submit"
          }
        }}
      />
    </div>
  );
};

const tabs = {
  Groups: {
    name: "Groups",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/CreateDAO.Step4`}
        props={{
          formState: policyState,
          updateParentState: (data) => setPolicyState(data),
          isConfigScreen: true,
          renderFooter: (data) => <></>
        }}
      />
    )
  },
  "Proposal and Voting Permissions": {
    name: "Proposal and Voting Permissions",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/CreateDAO.Step5`}
        props={{
          formState: policyState,
          updateParentState: (data) => setPolicyState(data),
          renderFooter: (data) => <></>
        }}
      />
    )
  },
  Quorum: {
    name: "Quorum",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/CreateDAO.Step6`}
        props={{
          formState: policyState,
          updateParentState: (data) => setPolicyState(data),
          renderFooter: (data) => <></>,
          isConfigScreen: true
        }}
      />
    )
  }
};

const Wrapper = styled.div`
  .custom-tag {
    border-top-right-radius: 9999px;
    border-bottom-right-radius: 9999px;
    border-top-left-radius: 9999px;
    border-bottom-left-radius: 9999px;
    padding-inline: 1rem;
    padding-block: 0.5rem;
    display: flex;
    gap: 0.5rem;
    border-width: 1px;
    border-style: solid;
    font-size: 14px;
    cursor: pointer;
    min-width: fit-content;
  }

  .selected {
    background-color: black;
    color: white;
  }
`;

const tabContent = tabs[selectedTab].component;

return (
  <Wrapper style={{ marginTop: 30 }}>
    <div
      className="d-flex gap-3 align-items-center h-100"
      style={{ overflow: "scroll" }}
    >
      {Object.keys(tabs).map((i) => (
        <div
          onClick={() => setSelectedTab(i)}
          className={"custom-tag " + (i === selectedTab ? "selected" : "")}
        >
          {i}
        </div>
      ))}
    </div>
    <div>{tabContent}</div>
    <Footer />
  </Wrapper>
);
