const post = props.post ?? {
  body: "# Hello, World!\nDo you know you can do this?",
  tags: ["hello", "world", "lorem ipsum"],
  images: [
    "https://ipfs.near.social/ipfs/bafkreifhkslni6dlocxya35vjft3fefk2am5uzkagmjjzobdjqlhrnbjz4",
  ],
  author: "",
  createdAt: new Date(),
  stats: {
    likes: 0,
    comments: 0,
    reactions: {
      heart: 0,
    },
    saves: 0,
  },
  reaction: null || "heart",
  liked: true,
  saved: false,
  shareLink: "http..",
};
const on = props.on ?? {
  like: () => {},
  showComments: () => {},
  react: () => {},
  save: () => {},
};

State.init({
  expand: false,
});

const Button = (props) => (
  <Widget src="/*__@appAccount__*//widget/Input.Button" props={props} />
);

return (
  <div
    {...props.containerProps}
    className={
      props.containerProps.className +
      " ndc-card p-3 rounded-3 gap-3 bg-white d-flex flex-column"
    }
    style={{
      boxShadow: "0px 4px 28px 0px rgba(140, 149, 159, 0.1)",
      ...props.containerProps.style,
    }}
  >
    <div className="d-flex justify-content-between gap-3">
      <Widget
        src="/*__@appAccount__*//widget/Element.User"
        props={{
          accountId: post.author,
          size: "md",
        }}
      />
      <div className="d-flex gap-3 align-items-center">
        <span>{`${new Date(post.createdAt).toLocaleString()}`}</span>
        <Button
          children={<i className="bi bi-flag" />}
          variant="icon outline info"
        />
        <Button
          children={<i className="bi bi-share" />}
          variant="icon outline info"
        />
      </div>
    </div>
    <div className="d-flex gap-3">
      <Widget
        src="/*__@appAccount__*//widget/Typography.Markdown"
        props={{
          content: post.body,
          style: {
            minHeight: 0,
            maxHeight: 100,
          },
          className: "w-100 flex-fill",
        }}
      />
      {!state.expand && post.images.length > 0 && (
        <div
          class="ratio ratio-4x3 ms-auto"
          style={{
            width: 300,
          }}
          tabIndex="0"
          role="button"
          onClick={() => State.update({ expand: true })}
        >
          <div
            role="img"
            style={{
              backgroundImage: `url(${post.images[0]})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "100%",
              backgroundColor: "#eee",
              borderRadius: 16,
            }}
          />
        </div>
      )}
    </div>
    <div className="d-flex gap-3 flex-wrap">
      {Array.isArray(post.tags) &&
        post.tags.map((tag, i) => {
          return (
            <Widget
              key={i}
              src="/*__@appAccount__*//widget/Element.Badge"
              props={{
                children: tag,
                variant: "disabled",
              }}
            />
          );
        })}
    </div>
    {state.expand && (
      <img
        class="ms-auto w-100"
        tabIndex="0"
        role="button"
        onClick={() => State.update({ expand: false })}
        src={post.images[0]}
      />
    )}
    <div className="d-flex gap-3 flex-wrap">
      <Button
        children={
          <>
            <i className="bi bi-hand-thumbs-up"></i>
            {post.stats.likes}
          </>
        }
        variant={["info", post.liked ? "" : "outline"]}
        onClick={on.like}
      />
      <Widget
        src="/*__@appAccount__*//widget/Social.ReactButton"
        props={{
          reactions: props.reactions,
          stats: post.stats.reactions,
          onChange: on.react,
          selected: post.reaction,
        }}
      />
      {!!on.showComments && (
        <Button
          children={
            <>
              <i className="bi bi-chat-left"></i>
              {post.stats.comments} comments
            </>
          }
          variant="outline info"
          onClick={on.showComments}
        />
      )}
      {false && (
        <Button
          children={
            <>
              <i className="bi bi-bookmark"></i>
              {post.stats.saves} Save
            </>
          }
          variant="outline info"
        />
      )}
      {false && (
        <Button
          children={
            <>
              <i className="bi bi-share" /> Share
            </>
          }
          variant="outline info"
        />
      )}
    </div>
  </div>
);
