const { Feed } = VM.require("devs.near/widget/Module.Feed") || {
  Feed: () => <></>
};

Feed = Feed || (() => <></>);

const accounts = props.accounts ?? [];
return (
  <Feed
    index={{
      action: "post",
      key: "main",
      options: {
        limit: 20,
        order: "desc",
        accountId: accounts
      }
    }}
    Item={(p) => {
      return (
        <Widget
          key={JSON.stringify(p)}
          src="/*__@appAccount__*//widget/Common.Components.Post"
          loading={<div style={{ height: "200px" }} />}
          props={{ accountId: p.accountId, blockHeight: p.blockHeight }}
        />
      );
    }}
  />
);
