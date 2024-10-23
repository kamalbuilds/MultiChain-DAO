const daoId = props.daoId;
const publicApiKey = "/*__@replace:pikespeakApiKey__*/";
const baseApi = "https://api.pikespeak.ai";
let voters = [];

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
  daoId === HoMDaoId || daoId === CoADaoId || daoId === TCDaoId;

function fetchIsHuman(account) {
  const userSBTs = Near.view("registry.i-am-human.near", "is_human", {
    account: account
  });
  let isHuman = false;
  if (userSBTs) {
    userSBTs.forEach((sbt) => {
      if ("fractal.i-am-human.near" === sbt[0]) {
        isHuman = true;
      }
    });
  }
  return isHuman;
}

function fetchIsUserFollowed(account) {
  const followEdge = Social.keys(
    `${context.accountId}/graph/follow/${account}`,
    undefined,
    {
      values_only: true
    }
  );
  return Object.keys(followEdge || {}).length > 0;
}

function addNonVotedMembers() {
  if (!policy?.users) {
    return;
  }
  Object.keys(policy.users)?.map((item) => {
    const index = voters.findIndex((d) => d.account === item);
    if (index === -1) {
      voters.push({
        account: item,
        groups: policy.users?.[item],
        approve: 0,
        rejected: 0,
        isHuman: fetchIsHuman(item),
        isUserFollowed: fetchIsUserFollowed(item)
      });
    }
  });
}

function fetchVotes() {
  const res = fetch(`${baseApi}/daos/votes/${daoId}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": publicApiKey
    }
  });

  if (res?.body?.length) {
    res?.body?.map((item) => {
      item.voters?.map((voterData) => {
        const accountIndex = voters.findIndex(
          (d) => d.account === voterData.account
        );
        if (accountIndex !== -1) {
          voters[accountIndex] = {
            ...voters[accountIndex],
            rejected: voters[accountIndex].rejected + voterData.rejected,
            approve: voters[accountIndex].approve + voterData.approve
          };
        } else {
          voters.push({
            ...voterData,
            isHuman: fetchIsHuman(voterData.account),
            isUserFollowed: fetchIsUserFollowed(voterData.account)
          });
        }
      });
    });
    // if any member have not voted on any proposal their data is not their in voters API
    if (policy?.users) {
      addNonVotedMembers();
    }
  } else {
    addNonVotedMembers();
  }
}

const processPolicy = (policy) => {
  const obj = {
    policy,
    users: {},
    roles: {},
    everyone: {}
  };
  policy.roles.forEach((role) => {
    if (role.kind === "Everyone") {
      obj.everyone = role;
    }
    if (role.kind.Group) {
      if (!obj.roles[role.name]) {
        obj.roles[role.name] = role;
      }
      role.kind.Group.forEach((user) => {
        if (!obj.users[user]) {
          obj.users[user] = [];
        }

        obj.users[user].push(role.name);
      });
    }
  });

  return obj;
};

function processCongressMembers(members) {
  let group = "";
  switch (daoId) {
    case HoMDaoId:
      group = "HoM Members";
      break;
    case CoADaoId:
      group = "CoA Members";
      break;

    case TCDaoId:
      group = "Transparency Commission Members";
      break;
  }
  const obj = {
    policy,
    users: {},
    roles: {
      [group]: {
        permissions: members?.permissions
      }
    },
    everyone: {}
  };

  members?.members?.map((item) => {
    obj.users[item] = [group];
  });
  return obj;
}

const policy = isCongressDaoID
  ? useCache(
      () =>
        Near.asyncView(daoId, "get_members").then((members) =>
          processCongressMembers(members)
        ),
      daoId + "-processed_congress_policy",
      { subscribe: false }
    )
  : daoId === VotingBodyDaoId
  ? null
  : useCache(
      () =>
        Near.asyncView(daoId, "get_policy").then((policy) =>
          processPolicy(policy)
        ),
      daoId + "-processed_policy",
      { subscribe: false }
    );

if (policy === null) return "";

fetchVotes();

const Wrapper = styled.div`
  .userRow {
    width: 100%;
    @media screen and (min-width: 600px) {
      width: calc(50% - 1rem);
    }
    @media screen and (min-width: 1400px) {
      width: calc(33% - 1rem);
    }
  }
`;

return (
  <div>
    <Wrapper className="d-flex flex-column gap-4">
      <Widget
        src="/*__@appAccount__*//widget/DAO.Members.MembersGroup"
        props={{
          data: voters,
          policy: policy,
          isCongressDaoID: isCongressDaoID,
          isVotingBodyDao: daoId === VotingBodyDaoId,
          daoId: daoId
        }}
      />
    </Wrapper>
  </div>
);
