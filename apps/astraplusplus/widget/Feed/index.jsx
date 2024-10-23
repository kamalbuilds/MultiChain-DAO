const [followingAccounts, setFollowingAccounts] = useState([]);

const graph = context.accountId
  ? Social.keys(`${context.accountId}/graph/follow/*`, "final")
  : {};

useEffect(() => {
  if (graph !== null) {
    const accounts = Object.keys(graph[context.accountId].graph.follow || {});
    setFollowingAccounts(accounts);
  }
}, [graph, context.accountId]);

const renderHeader = () => (
  <div>
    <h2 className="h2 mb-2">Social Feed</h2>
    <div>
      <Widget
        key="reg-feed"
        src="near/widget/v1.Posts.Feed"
        props={{
          accounts: followingAccounts.length > 0 ? followingAccounts : undefined
        }}
      />
    </div>
  </div>
);

return <div>{renderHeader()}</div>;
