/*__@import:daoHelpers/getFollowedDAOs__*/

const { router } = props;
const filter = props.filter;
const accountId = props.accountId ?? context.accountId ?? "";

let followedDAOs = null;
if (filter === "followedDAOs") {
  followedDAOs = getFollowedDAOs(accountId);
  if (followedDAOs === null) return "";
}

const publicApiKey = "/*__@replace:pikespeakApiKey__*/";
const resPerPage = 10;

const forgeUrl = (apiUrl, params) =>
  apiUrl +
  Object.keys(params)
    .sort()
    .reduce((paramString, p) => paramString + `${p}=${params[p]}&`, "?");

let daos = null;
if (filter === "followedDAOs") {
  daos = followedDAOs.map((dao) => ({
    contract_id: dao,
  }));
} else if (filter === "myDAOs") {
  daos = useCache(
    () =>
      // TODO: need better API for this, fetching all members daos is not efficient
      asyncFetch(forgeUrl(`https://api.pikespeak.ai/daos/members`, {}), {
        mode: "cors",
        headers: {
          "x-api-key": publicApiKey,
        },
      }).then((res) => {
        return res.body[accountId]["daos"].map((dao) => ({
          contract_id: dao,
        }));
      }),
    "my-daos-" + accountId,
    { subscribe: false },
  );
} else if (filter === "ndcDAOs") {
  daos = [
    "ndctrust.sputnik-dao.near",
    "gwg.sputnik-dao.near",
    "gwg-stables.sputnik-dao.near",
  ].map((dao) => ({
    contract_id: dao,
  }));
} else {
  daos = fetch(forgeUrl(`https://api.pikespeak.ai/daos/all`, {}), {
    mode: "cors",
    headers: {
      "x-api-key": publicApiKey,
      "cache-control": "max-age=86400", // 1 day
    },
  });
  if (daos === null) return "";
  daos = daos?.body;
}

const createDAOLink = "#//*__@appAccount__*//widget/home?page=create-dao";

const renderHeader = () => (
  <div className="d-flex justify-content-between gap-2 align-items-center">
    <h2 className="h2">DAOs</h2>
    <Widget
      src="nearui.near/widget/Input.Button"
      props={{
        variant: "info",
        size: "lg",
        buttonProps: {
          style: {
            fontWeight: 500,
          },
        },
        children: (
          <>
            Create a new DAO
            <i className="bi bi-plus-lg"></i>
          </>
        ),
        href: createDAOLink,
      }}
    />
  </div>
);

const renderDAOs = () => {
  return (
    <Widget
      src="/*__@appAccount__*//widget/DAOs.list"
      props={{
        daos,
        router,
      }}
    />
  );
};

return (
  <div>
    {renderHeader()}
    {renderDAOs()}
  </div>
);
