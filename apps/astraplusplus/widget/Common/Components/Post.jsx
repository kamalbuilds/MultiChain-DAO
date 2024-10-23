const accountId = props.accountId;
const blockHeight =
  props.blockHeight === "now" ? "now" : parseInt(props.blockHeight);
const subscribe = !!props.subscribe;
const notifyAccountId = accountId;
const postUrl = `https://near.org/s/p?a=${accountId}&b=${blockHeight}`;
const showFlagAccountFeature = props.showFlagAccountFeature;

State.init({ hasBeenFlagged: false });

const edits = []; // Social.index('edit', { accountId, blockHeight }, { limit: 1, order: "desc", accountId })

const content =
  props.content ??
  JSON.parse(
    edits.length
      ? Social.get(`${accountId}/edit/main`, edits.blockHeight)
      : Social.get(`${accountId}/post/main`, blockHeight)
  );

const item = {
  type: "social",
  path: `${accountId}/post/main`,
  blockHeight
};

const Post = styled.div`
  position: relative;

  &::before {
    content: "";
    display: block;
    position: absolute;
    left: 19px;
    top: 52px;
    bottom: 12px;
    width: 2px;
    background: #eceef0;
  }

  [data-component="near/widget/AccountProfile"] {
    border-radius: 0px !important;
  }
`;

const Header = styled.div`
  margin-bottom: 0;
  display: inline-flex;

  p[data-component="near/widget/AccountProfile"] {
    display: none !important;
  }
`;

const Body = styled.div`
  padding-left: 52px;
  padding-bottom: 1px;

  a {
    padding-inline: 5px;
    padding-block: 2px;
    border-radius: 8px;
    border: 1px solid #e1e3fd;
    background: #f5f6fe;
    color: #626ad1 !important;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
  }

  li a {
    margin-right: 2px;
  }

  a[data-component="near/widget/AccountProfile"] {
    border: none;
  }

  ul {
    line-height: 30px;
  }
`;

const Content = styled.div`
  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    margin: 0 0 12px;
  }
`;

const Text = styled.p`
  display: block;
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #687076;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: -6px -6px 6px;
`;

const Comments = styled.div`
  > div > div:first-child {
    padding-top: 12px;
  }
`;

if (state.hasBeenFlagged) {
  return (
    <div className="alert alert-secondary">
      <i className="bi bi-flag" /> This content has been flagged for moderation
    </div>
  );
}

const profile = Social.get(`${accountId}/profile/**`, "final");

function readableDate(timestamp) {
  var a = new Date(timestamp);
  var options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  return a.toLocaleString("en-US", options);
}

const res = fetch(`https://api.near.social/time?blockHeight=${blockHeight}`);
if (!res) {
  return "Loading";
}

const timeMs = parseFloat(res.body);

return (
  <Post>
    <Header>
      <div className="row">
        <div className="col-auto" style={{ paddingRight: 0 }}>
          <Widget
            src="near/widget/AccountProfile"
            props={{
              accountId,
              hideAccountId: true,
              showFlagAccountFeature
            }}
          />
        </div>
        <div className="col-auto" style={{ paddingLeft: 0 }}>
          <h5 className="text-truncate mb-0">
            {profile.name || accountId.split(".near")[0]}
          </h5>
          <p style={{ fontSize: "12px" }} className="text-muted">
            Updated at {readableDate(timeMs)}
          </p>
        </div>
      </div>
    </Header>

    <Body>
      <Content>
        {content.text && (
          <Widget
            src="near/widget/SocialMarkdown"
            props={{ text: content.text }}
          />
        )}

        {content.image && (
          <Widget
            src="mob.near/widget/Image"
            props={{
              image: content.image
            }}
          />
        )}
      </Content>

      {blockHeight !== "now" && (
        <Actions>
          <Widget
            src="near/widget/v1.LikeButton"
            props={{
              item,
              notifyAccountId
            }}
          />
          <Widget
            src="near/widget/CommentButton"
            props={{
              item,
              onClick: () => State.update({ showReply: !state.showReply })
            }}
          />
          <Widget
            src="near/widget/CopyUrlButton"
            props={{
              url: postUrl
            }}
          />
          <Widget
            src="near/widget/ShareButton"
            props={{
              postType: "post",
              url: postUrl
            }}
          />
          <Widget
            src="near/widget/FlagButton"
            props={{
              item,
              disabled: !context.accountId || context.accountId === accountId,
              onFlag: () => {
                State.update({ hasBeenFlagged: true });
              }
            }}
          />
        </Actions>
      )}

      {state.showReply && (
        <div>
          <div className="mb-2">
            <Widget
              src="near/widget/Comments.Compose"
              props={{
                notifyAccountId,
                item,
                onComment: () => State.update({ showReply: false })
              }}
            />
          </div>
          <Comments>
            <Widget
              src="near/widget/Comments.Feed"
              props={{
                item,
                highlightComment: props.highlightComment,
                limit: props.commentsLimit,
                subscribe,
                raw
              }}
            />
          </Comments>
        </div>
      )}
    </Body>
  </Post>
);
