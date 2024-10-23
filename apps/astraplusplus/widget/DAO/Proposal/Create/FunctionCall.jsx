const accountId = props.accountId ?? context.accountId;
const contractId = props.contractId;
const onClose = props.onClose;
const daoId = props.daoId;
const isCongressDaoID = props.isCongressDaoID;
const powerType = props.powerType;
const showPowers = props.showPowers ?? true;
const registry = props.registry;
const isVotingBodyDao = props.isVotingBodyDao;
const policy = props.daoPolicy;

const CoADaoId = props.dev
  ? "/*__@replace:CoADaoIdTesting__*/"
  : "/*__@replace:CoADaoId__*/";
const VotingBodyDaoId = props.dev
  ? "/*__@replace:VotingBodyDaoIdTesting__*/"
  : "/*__@replace:VotingBodyDaoId__*/";
const TCDaoId = props.dev
  ? "/*__@replace:TCDaoIdTesting__*/"
  : "/*__@replace:TCDaoId__*/";
const HoMDaoId = props.dev
  ? "/*__@replace:HoMDaoIdTesting__*/"
  : "/*__@replace:HoMDaoId__*/";

if (!accountId) {
  return "Please connect your NEAR wallet :)";
}

function isEmpty(value) {
  return !value || value === "";
}

State.init({
  contractId: state.contractId,
  method_name: state.method_name,
  args: state.args || "{}",
  deposit: state.deposit || "0",
  gas: "270",
  error: undefined,
  receiver_id: null,
  description: null,
  powerType,
  member: null, // for dismiss and ban hook
  house: null, // for dismiss and ban hook
  accounts: null, // for unban hook
  memo: null, // for unban hook
  showReceiverAsOptions: false,
  disableReceiverField: false,
  attachDeposit: 0,
  proposalQueue: null,
  notificationsData: {}
});

const fc_args = Buffer.from(state.args, "utf-8").toString("base64");

function isNearAddress(address) {
  const ACCOUNT_ID_REGEX =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
  return (
    address.length >= 2 &&
    address.length <= 64 &&
    ACCOUNT_ID_REGEX.test(address)
  );
}

const handleFunctionCall = () => {
  if (!isCongressDaoID && !VotingBodyDaoId) {
    if (isEmpty(state.contractId) || !isNearAddress(state.contractId)) {
      State.update({
        error: "Please enter a valid contract ID"
      });
      return;
    }
  }
  if (state.powerType !== "Unban" && state.powerType !== "DismissAndBan") {
    if (isEmpty(state.method_name)) {
      State.update({
        error: "Please enter a valid method name"
      });
      return;
    }

    const is_valid_json = (str) => {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    };

    if (isEmpty(state.args) || !is_valid_json(state.args)) {
      State.update({
        error: "Please enter a valid JSON arguments"
      });
      return;
    }
    if (isEmpty(state.deposit) || state.deposit < 0) {
      State.update({
        error: "Please enter a valid deposit"
      });
      return;
    }
    if (isEmpty(state.gas) || state.gas <= 0) {
      State.update({
        error: "Please enter a valid gas"
      });
      return;
    }
    if (state.gas > 270) {
      State.update({
        error: "Maximum gas allowed is 270Tgas"
      });
      return;
    }
  }

  const deposit = Big(state.deposit).mul(Big(10).pow(24)).toFixed();
  const gas = Big(state.gas).mul(Big(10).pow(12)).toFixed();
  if (isVotingBodyDao) {
    if (isEmpty(state.description)) {
      State.update({
        error: "Please enter a description"
      });
      return;
    }
    Near.call([
      {
        contractName: registry,
        methodName: "is_human_call",
        args: {
          ctr: daoId,
          function: "create_proposal",
          payload: JSON.stringify({
            kind: {
              FunctionCall: {
                receiver_id: state.receiver_id,
                actions: [
                  {
                    method_name: state.method_name,
                    args: fc_args,
                    deposit: deposit,
                    gas: gas
                  }
                ]
              }
            },
            caller: accountId,
            description: state.description
          })
        },
        deposit: state.attachDeposit
          ? Big(state.attachDeposit)
          : 100000000000000000000000,
        gas: 200000000000000
      }
    ]);
  } else {
    const calls = [];
    if (isCongressDaoID) {
      if (isEmpty(state.description)) {
        State.update({
          error: "Please enter a description"
        });
        return;
      }
      let args = {};
      if (state.powerType === "Unban") {
        const accountsArray = state.accounts
          ?.split(",")
          .map((item) => item.trim());
        if (
          !accountsArray?.length ||
          accountsArray?.some((item) => !isNearAddress(item))
        ) {
          State.update({
            error: "Please enter valid account IDs"
          });
          return;
        }
        if (isEmpty(state.memo)) {
          State.update({
            error: "Please enter a valid memo"
          });
          return;
        }

        args = {
          kind: {
            FunctionCall: {
              receiver_id: registry,
              actions: [
                {
                  method_name: "admin_unflag_accounts",
                  args: Buffer.from(
                    JSON.stringify({
                      accounts: accountsArray,
                      memo: state.memo
                    }),
                    "utf-8"
                  ).toString("base64"),
                  deposit: deposit,
                  gas: gas
                }
              ]
            }
          },
          description: state.description
        };
      } else {
        if (state.powerType === "DismissAndBan") {
          if (isEmpty(state.house) || !isNearAddress(state.house)) {
            State.update({
              error: "Please enter a valid house contract ID"
            });
            return;
          }

          if (isEmpty(state.member) || !isNearAddress(state.member)) {
            State.update({
              error: "Please enter a valid member ID"
            });
            return;
          }
          args = {
            kind: {
              DismissAndBan: {
                member: state.member,
                house: state.house
              }
            },
            description: state.description
          };
        } else {
          if (isEmpty(state.receiver_id) || !isNearAddress(state.receiver_id)) {
            State.update({
              error: "Please enter a valid recipient address"
            });
            return;
          }
          args = {
            kind: {
              FunctionCall: {
                receiver_id: state.receiver_id,
                actions: [
                  {
                    method_name: state.method_name,
                    args: fc_args,
                    deposit: deposit,
                    gas: gas
                  }
                ]
              }
            },
            description: state.description
          };
        }
      }
      calls.push({
        contractName: daoId,
        methodName: "create_proposal",
        args: args,
        deposit: 100000000000000000000000,
        gas: 200000000000000
      });
    } else {
      calls.push({
        contractName: daoId,
        methodName: "add_proposal",
        args: {
          proposal: {
            description: state.description,
            kind: {
              FunctionCall: {
                receiver_id: state.contractId,
                actions: [
                  {
                    method_name: state.method_name,
                    args: fc_args,
                    deposit: deposit,
                    gas: gas
                  }
                ]
              }
            }
          }
        },
        deposit: policy?.proposal_bond || 100000000000000000000000,
        gas: 200000000000000
      });
    }
    if (state.notificationsData) {
      calls.push(state.notificationsData);
    }

    Near.call(calls);
  }
};

const onChangeContract = (contractId) => {
  State.update({
    contractId,
    error: undefined
  });
};

const onChangeMethod = (method_name) => {
  State.update({
    method_name,
    error: undefined
  });
};

const onChangeArgs = (args) => {
  State.update({
    args,
    error: undefined
  });
};

const onChangeGas = (gas) => {
  State.update({
    gas,
    error: undefined
  });
};

const onChangeDeposit = (deposit) => {
  State.update({
    deposit,
    error: undefined
  });
};

const onChangeDescription = (description) => {
  State.update({
    description,
    error: undefined
  });
};

const onChangeRecipient = (receiver_id) => {
  State.update({
    receiver_id,
    error: undefined
  });
};

const onChangeHouse = (house) => {
  State.update({
    house,
    error: undefined
  });
};

const onChangeMember = (member) => {
  State.update({
    member,
    error: undefined
  });
};

const onChangeAccounts = (accounts) => {
  State.update({
    accounts,
    error: undefined
  });
};

const onChangeMemo = (memo) => {
  State.update({
    memo,
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

    {state.powerType === "DismissAndBan" ? (
      <>
        <div className="mb-3">
          <h5>Member</h5>
          <input
            type="text"
            value={state.member}
            onChange={(e) => onChangeMember(e.target.value)}
            placeholder="Specify member account"
          />
        </div>
        <Widget
          src="/*__@appAccount__*//widget/DAO.Proposal.Common.CongressHouseDropdown"
          props={{
            daoId: daoId,
            label: "House",
            placeholder: "Select house account",
            onUpdate: (house) => {
              State.update({
                house: house,
                error: undefined
              });
            }
          }}
        />
      </>
    ) : (
      <>
        {state.powerType === "Unban" ? (
          <>
            <div className="mb-3">
              <h5>Accounts List (separated by comma)</h5>
              <input
                type="text"
                value={state.accounts}
                onChange={(e) => onChangeAccounts(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <h5>Memo</h5>
              <Widget
                src="/*__@appAccount__*//widget/Common.Components.Markdown"
                props={{
                  value: state.memo,
                  onChange: (value) => onChangeMemo(value),
                  height: "160px",
                  initialText: ""
                }}
              />
            </div>
          </>
        ) : (
          <>
            {!isCongressDaoID && !isVotingBodyDao && (
              <div className="mb-3">
                <h5>Contract</h5>
                <input
                  type="text"
                  value={state.contractId}
                  onChange={(e) => onChangeContract(e.target.value)}
                />
              </div>
            )}
            <div className="mb-3">
              <h5>Method</h5>
              <input
                disabled={state.powerType && state.method_name}
                type="text"
                value={state.method_name}
                onChange={(e) => onChangeMethod(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <h5>Arguments (JSON)</h5>
              <textarea
                type="text"
                value={state.args}
                onChange={(e) => onChangeArgs(e.target.value)}
                className="form-control"
                defaultValue={state.args}
              />
            </div>
            {state.showReceiverAsOptions && (
              <div className="mb-3">
                <Widget
                  src="/*__@appAccount__*//widget/DAO.Proposal.Common.CongressHouseDropdown"
                  props={{
                    daoId: daoId,
                    label: "Recipient",
                    placeholder: "Select Recipient account",
                    onUpdate: (house) => {
                      State.update({
                        receiver_id: house,
                        error: undefined
                      });
                    }
                  }}
                />
              </div>
            )}
            {((isCongressDaoID && !state.showReceiverAsOptions) ||
              isVotingBodyDao) && (
              <div className="mb-3">
                <h5>Recipient</h5>
                <input
                  disabled={state.disableReceiverField}
                  type="text"
                  value={state.receiver_id}
                  onChange={(e) => onChangeRecipient(e.target.value)}
                  placeholder="Specify target account"
                />
              </div>
            )}
            {!isCongressDaoID && !isVotingBodyDao && (
              <div className="mb-3">
                <h5>Gas (Tgas)</h5>
                <input
                  type="number"
                  value={state.gas}
                  onChange={(e) => onChangeGas(e.target.value)}
                  defaultValue="270"
                />
              </div>
            )}
          </>
        )}
        <div className="mb-3">
          <h5>Deposit (NEAR)</h5>
          <input
            type="number"
            value={state.deposit}
            onChange={(e) => onChangeDeposit(e.target.value)}
            defaultValue={0}
          />
        </div>
      </>
    )}
    <div className="mb-3">
      <h5>Description</h5>
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
        proposalType: "Function call"
      }}
    />
    {state.error && <div className="text-danger">{state.error}</div>}
    <div className="ms-auto">
      <Widget
        src="/*__@appAccount__*//widget/Common.Components.Button"
        props={{
          children: "Propose Function Call",
          onClick: handleFunctionCall,
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
