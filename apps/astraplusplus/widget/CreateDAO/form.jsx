const { typeToEmptyData, validateType, types } = props;

const initialFormState = typeToEmptyData(types["/*__@appAccount__*//type/dao"]);

// Set default values here
initialFormState.gracePeriod = 1;
initialFormState.profileImage =
  "https://ipfs.near.social/ipfs/bafkreiad5c4r3ngmnm7q6v52joaz4yti7kgsgo6ls5pfbsjzclljpvorsu";
initialFormState.coverImage =
  "https://ipfs.near.social/ipfs/bafkreicd7wmjfizslx72ycmnsmo7m7mnvfsyrw6wghsaseq45ybslbejvy";

State.init({
  step: 0,
  form: initialFormState,
  errors: null
});

const handleStepComplete = (value) => {
  const stepValid = true;
  Object.keys(value).forEach((key) => {
    const properties = types["/*__@appAccount__*//type/dao"].properties.find(
      (p) => p.name === key
    );
    const validation = validateType(properties.type, value[key], properties);
    if (validation) {
      State.update({
        errors: {
          ...state.errors,
          [key]: validation
        }
      });
      stepValid = false;
    } else {
      State.update({
        errors: {
          ...state.errors,
          [key]: null
        }
      });
    }
  });

  if (!stepValid) return;

  if (state.step === 6) {
    const finalAnswers = {
      ...state.form,
      ...value
    };

    State.update({
      step: state.step,
      form: finalAnswers
    });
    setShowNote(true);
    return;
  }
  State.update({
    step: state.step + 1,
    form: {
      ...state.form,
      ...value
    }
  });
};
const [showNoteModal, setShowNote] = useState(false);
const [copied, setCopied] = useState(false);

useEffect(() => {
  let timeoutId;

  if (copied) {
    timeoutId = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return () => {
    clearTimeout(timeoutId);
  };
}, [copied]);

const NoteContainer = styled.div`
  a {
    color: #4498e0;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const NoteModal = () => {
  const url = `https://near.org/astraplusplus.ndctools.near/widget/home?tab=proposals&daoId=${state.form.address}&page=dao`;
  return (
    <Widget
      src="/*__@appAccount__*//widget/Layout.Modal"
      props={{
        open: showNoteModal,
        onOpenChange: (open) => {
          setShowNote(open);
        },
        toggle: <></>,
        content: (
          <NoteContainer className="ndc-card p-4 d-flex flex-column gap-2">
            <h6 className="mb-0">
              Please note that upon confirming the transaction, your DAO will
              appear within the next hour in both the "My DAOs" and "All DAOs"
              sections.
              <br />
              <br /> To access it beforehand, please copy the following{" "}
              <a target="_blank" rel="noopener noreferrer" href={url}>
                link.
              </a>
            </h6>
            <div className="d-flex gap-2 justify-content-end">
              <Widget
                src="nearui.near/widget/Input.Button"
                props={{
                  children: "Cancel",
                  variant: "danger outline",
                  onClick: () => setShowNote(false)
                }}
              />
              <Widget
                src="nearui.near/widget/Input.Button"
                props={{
                  children: "Copy link",
                  variant: "info",
                  onClick: () => {
                    clipboard.writeText(url).then(() => {
                      setCopied(true);
                      handleFormComplete(state.form);
                      setShowNote(false);
                    });
                  }
                }}
              />
            </div>
          </NoteContainer>
        )
      }}
    />
  );
};

function handleFormComplete(value) {
  const sputnikFactoryArgs = {
    name: value.address.replaceAll(".sputnik-dao.near", ""),
    // encode args to base64
    args: {
      purpose: typeof value.purpose === "string" ? value.purpose : "",
      bond: "100000000000000000000000",
      vote_period: "604800000000000",
      grace_period: Big(
        typeof value.gracePeriod === "number" ? parseInt(value.gracePeriod) : 1
      ).times(86400000000000),
      policy: {
        roles: value.policy.roles,
        default_vote_policy: {
          weight_kind: "RoleWeight",
          quorum: "0",
          threshold: [1, 2]
        },
        proposal_bond: "100000000000000000000000",
        proposal_period: "604800000000000",
        bounty_bond: "100000000000000000000000",
        bounty_forgiveness_period: "604800000000000"
      },
      config: {
        purpose: typeof value.purpose === "string" ? value.purpose : "",
        name: value.address.replaceAll(".sputnik-dao.near", ""),
        // encode metadata to base64
        metadata: {
          soulBoundTokenIssuer:
            typeof value.soulBoundTokenIssuer === "string"
              ? value.soulBoundTokenIssuer
              : undefined,
          links: Array.isArray(value.links) ? value.links : [],
          flagCover:
            typeof value.coverImage === "string" ? value.coverImage : "",
          flagLogo:
            typeof value.profileImage === "string" ? value.profileImage : "",
          displayName: typeof value.name === "string" ? value.name : "",
          legal: {
            legalStatus:
              typeof value.legalStatus === "string" ? value.legalStatus : "",
            legalLink:
              typeof value.legalDocument === "string" ? value.legalDocument : ""
          }
        }
      }
    }
  };

  // encode metadata and args to base64
  const finalSputnikFactoryArgs = {
    ...sputnikFactoryArgs,
    args: Buffer.from(
      JSON.stringify({
        ...sputnikFactoryArgs.args,
        config: {
          ...sputnikFactoryArgs.args.config,
          metadata: Buffer.from(
            JSON.stringify(sputnikFactoryArgs.args.config.metadata)
          ).toString("base64")
        }
      })
    ).toString("base64")
  };
  Near.call([
    {
      contractName: "sputnik-dao.near",
      methodName: "create",
      args: finalSputnikFactoryArgs,
      deposit: "6000000000000000000000000", // 6N
      gas: 250000000000000
    }
  ]);
}

const steps = [
  {
    title: "DAO Info & KYC",
    active: state.step === 0,
    icon: state.step > 0 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 0 ? "active-outline" : undefined
  },
  {
    title: "Links & Socials",
    active: state.step === 1,
    icon: state.step > 1 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 1 ? "active-outline" : undefined
  },
  {
    title: "Cool Down Period",
    active: state.step === 2,
    icon: state.step > 2 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 2 ? "active-outline" : undefined
  },
  {
    title: "Add Groups & Members",
    active: state.step === 3,
    icon: state.step > 3 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 3 ? "active-outline" : undefined
  },
  {
    title: "Proposal & Voting Permission",
    active: state.step === 4,
    icon: state.step > 4 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 4 ? "active-outline" : undefined
  },
  {
    title: "Quorum",
    active: state.step === 5,
    icon: state.step > 5 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 5 ? "active-outline" : undefined
  },
  {
    title: "DAO Assets",
    active: state.step === 6,
    icon: state.step > 6 ? <i className="bi bi-check2"></i> : undefined,
    className: state.step > 6 ? "active-outline" : undefined
  }
];

return (
  <>
    <h1 className="h3 fw-bold mb-4">Create a new DAO</h1>
    <NoteModal />
    <Widget
      src={`nearui.near/widget/Navigation.Steps`}
      props={{
        steps: steps,
        onClick: (i) => {
          if (i > state.step) return;
          State.update({
            step: i
          });
        }
      }}
    />
    <Widget
      src="near/widget/DIG.Toast"
      props={{
        title: "Copied",
        open: copied
      }}
    />
    <Widget
      src={`/*__@appAccount__*//widget/CreateDAO.Step${state.step + 1}`}
      props={{
        formState: state.form,
        onComplete: handleStepComplete,
        errors: state.errors,
        renderFooter: (stepState, otherProps) => (
          <Widget
            src={`/*__@appAccount__*//widget/CreateDAO.Footer`}
            props={{
              isLast: state.step >= steps.length - 1,
              hasPrevious: state.step > 0,
              onNext: () => {
                handleStepComplete(stepState);
              },
              onPrevious: () => {
                State.update({
                  step: state.step - 1
                });
              },
              onReset: () => {
                State.update({
                  step: 0,
                  form: initialFormState,
                  errors: null
                });
              },

              ...otherProps
            }}
          />
        ),
        showSteps: true,
        showCreateNewDAOInfo: true,
        isConfigScreen: false
      }}
    />
  </>
);
