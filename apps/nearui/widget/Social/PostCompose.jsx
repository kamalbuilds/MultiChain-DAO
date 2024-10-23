const initialBody = props.initialBody ?? `Create Post`;
const onPost = props.onPost ?? ((p) => console.log(p));
const disabled = props.disabled;
const buttonText = props.buttonText ?? "Post";

State.init({});

return (
  <div
    className="ndc-card p-3 rounded-3 d-grid gap-3 bg-white"
    style={{
      boxShadow: "0px 4px 28px 0px rgba(140, 149, 159, 0.1)",
      gridTemplateColumns: "40px auto",
      opacity: disabled ? 0.7 : 1,
      pointerEvents: disabled ? "none" : "all",
    }}
  >
    <Widget
      src="mob.near/widget/ProfileImage"
      props={{
        accountId: context.accountId,
        className: "float-start d-inline-block me-2",
        imageClassName: "rounded-circle w-100 h-100",
        style: {
          width: 40,
          height: 40,
        },
      }}
    />

    <Widget
      src="mob.near/widget/MarkdownEditorIframe"
      props={{
        initialText: initialBody,
        onChange: (body) => State.update({ body }),
      }}
    />

    <div
      className="d-flex justify-content-end"
      style={{
        gridColumn: "span 2",
      }}
    >
      <Widget
        src="/*__@appAccount__*//widget/Input.Button"
        props={{
          variant: "info",
          children: buttonText,
          onClick: () => onPost(state.body || initialBody),
          disabled: !context.accountId,
        }}
      />
    </div>
  </div>
);
