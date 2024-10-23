const { formState, daoId, hasPermission } = props;
const [configState, setConfigState] = useState({
  ...formState,
  coverImage: formState.flagCover ?? formState.coverImage,
  profileImage: formState.flagLogo ?? formState.profileImage,
  legalStatus: formState.legal.legalStatus,
  legalDocument: formState.legal.legalLink
});
const [selectedTab, setSelectedTab] = useState("Info");

const handleProposal = () => {
  const deposit = formState.policy.proposal_bond;
  const gas = 200000000000000;
  const metadata = {
    soulBoundTokenIssuer:
      typeof configState.soulBoundTokenIssuer === "string"
        ? configState.soulBoundTokenIssuer
        : undefined,
    links: Array.isArray(configState.links) ? configState.links : [],
    flagCover:
      typeof configState.coverImage === "string" ? configState.coverImage : "",
    flagLogo:
      typeof configState.profileImage === "string"
        ? configState.profileImage
        : "",
    displayName: typeof configState.name === "string" ? configState.name : "",
    legal: {
      legalStatus:
        typeof configState.legalStatus === "string"
          ? configState.legalStatus
          : "",
      legalLink:
        typeof configState.legalDocument === "string"
          ? configState.legalDocument
          : ""
    }
  };
  Near.call([
    {
      contractName: daoId,
      methodName: "add_proposal",
      args: {
        proposal: {
          description: "Update config",
          kind: {
            ChangeConfig: {
              config: {
                name: configState.name,
                purpose: configState.purpose,
                metadata: Buffer.from(JSON.stringify(metadata)).toString(
                  "base64"
                )
              }
            }
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
  Info: {
    name: "Info and KYC",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/CreateDAO.Step1`}
        props={{
          formState: configState,
          isConfigScreen: true,
          updateParentState: (data) => setConfigState(data),
          renderFooter: () => <></>
        }}
      />
    )
  },
  Legal: {
    name: "Legal Links",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/CreateDAO.Step2`}
        props={{
          formState: configState,
          isConfigScreen: true,
          updateParentState: (data) => setConfigState(data),
          renderFooter: () => <></>
        }}
      />
    )
  },
  Visual: {
    name: "Visual Changes",
    component: (
      <Widget
        src={`/*__@appAccount__*//widget/CreateDAO.Step7`}
        props={{
          formState: configState,
          isConfigScreen: true,
          updateParentState: (data) => setConfigState(data),
          renderFooter: () => <></>
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
