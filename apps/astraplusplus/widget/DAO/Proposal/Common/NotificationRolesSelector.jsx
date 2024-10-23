const DaoSDK = VM.require("sdks.near/widget/SDKs.Sputnik.DaoSDK");

if (!DaoSDK) {
  return <></>;
}
const [groupsAndMembers, setGroupsAndMembers] = useState([]);
const [selectedRoles, setSelectedRoles] = useState({}); // { role:boolean }
const daoId = props.daoId;
const accountId = props.accountId ?? context.accountId;
const onUpdate = props.onUpdate ?? (() => {});
const proposalType = props.proposalType;

const sdk = DaoSDK(daoId);
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

const isCongressDaoID =
  props.daoId === HoMDaoId ||
  props.daoId === CoADaoId ||
  props.daoId === TCDaoId;
const isVotingBodyDao = props.daoId === VotingBodyDaoId;

useEffect(() => {
  if (isCongressDaoID) {
    const data = Near.view(daoId, "get_members");
    if (data === null) {
      return;
    }
    setGroupsAndMembers([{ name: "Council", members: data.members }]);
  } else {
    const group = sdk.getGroupsAndMembers();
    if (group === null || !group.length) {
      return;
    }
    setGroupsAndMembers(group);
  }
}, []);

const handleCheckboxChange = (role) => {
  setSelectedRoles((prevRoles) => {
    // Check if the role already exists in the state
    if (prevRoles.hasOwnProperty(role)) {
      // If it exists, update the 'selected' value
      return {
        ...prevRoles,
        [role]: !prevRoles[role]
      };
    } else {
      // If it doesn't exist, add it with 'selected' set to true
      return {
        ...prevRoles,
        [role]: true
      };
    }
  });
};

const createNotificationsData = () => {
  const someRoleSelected = Object.values(selectedRoles).some(
    (value) => value === true
  );
  if (!someRoleSelected) {
    return null;
  }
  const membersToNotify = [];
  Object.keys(selectedRoles).map((item) => {
    if (selectedRoles[item] === true) {
      membersToNotify = membersToNotify.concat(
        groupsAndMembers.find((group) => group.name === item).members
      );
    }
  });
  const uniqueMembersArray = [...new Set(membersToNotify)];
  const notification = {
    [accountId]: {
      index: {
        notify: JSON.stringify(
          uniqueMembersArray.map((account) => {
            return {
              key: account,
              value: {
                message: `${accountId} created ${proposalType} proposal for ${daoId}`,
                params: {
                  daoId: daoId,
                  tab: "proposals",
                  page: "dao"
                },
                type: "custom",
                widget: "astraplusplus.ndctools.near/widget/home"
              }
            };
          })
        )
      }
    }
  };
  const call = {
    contractName: "social.near",
    methodName: "set",
    args: { data: notification, options: { refund_unused_deposit: true } },
    deposit: 100000000000000000000000
  };
  return call;
};

useEffect(() => {
  onUpdate(createNotificationsData());
}, [selectedRoles]);

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const groupList = useMemo(() => {
  return (
    Array.isArray(groupsAndMembers) &&
    groupsAndMembers.map((group) => {
      const membersLength = group?.members.length;
      if (!membersLength) {
        return null;
      }
      return (
        <Widget
          src="nearui.near/widget/Input.Checkbox"
          props={{
            label: (
              <div>
                {capitalizeFirstLetter(group.name)} ({membersLength} members)
              </div>
            ),
            onChange: (checked) => handleCheckboxChange(group.name),
            checked: selectedRoles[group.name] ?? false
          }}
        />
      );
    })
  );
}, [groupsAndMembers, selectedRoles]);

if (isVotingBodyDao) {
  return;
}

return (
  <div>
    <div>
      Send notification to following roles:{" "}
      <span className="text-muted">(Optional)</span>
    </div>
    {groupList}
  </div>
);
