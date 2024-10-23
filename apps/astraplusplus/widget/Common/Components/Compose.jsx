const autocompleteEnabled = props.autocompleteEnabled ?? true;
const onPreview = props.onPreview;
const accountId = props.accountId;
const onPostClick = props.onPostClick ?? (() => {});

const [editorKey, setEditorKey] = useState(0);
const memoizedEditorKey = useMemo(() => editorKey, [editorKey]);

const MemoizedAvatar = useMemo(
  () => (
    <Widget
      src="near/widget/AccountProfile"
      props={{
        accountId
      }}
    />
  ),
  [accountId]
);

const Wrapper = styled.div`
  line-height: normal;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;

  .right {
    flex-grow: 1;
    min-width: 0;
  }

  .up-buttons {
    margin-top: 12px;

    @media screen and (max-width: 768px) {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  }

  div[data-component="near/widget/AccountProfile"] {
    border-radius: 0px !important;
  }
`;

const embedCss = `
.rc-md-editor {
  border-radius: 10px;
  overflow: auto;
}
`;

const TextareaWrapper = styled.div`
  display: grid;
  vertical-align: top;
  align-items: center;
  position: relative;
  align-items: stretch;

  textarea {
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
  }

  textarea::placeholder {
    padding-top: 4px;
    font-size: 20px;
  }

  textarea:focus::placeholder {
    font-size: inherit;
    padding-top: 0px;
  }

  &::after,
  textarea,
  iframe {
    width: 100%;
    padding: 8px 0;
    min-width: 1em;
    height: unset;
    min-height: 3em;
    font: inherit;
    margin: 0;
    resize: none;
    background: none;
    appearance: none;
    border: 0px solid #eee;
    grid-area: 1 / 1;
    overflow: hidden;
    outline: none;
  }

  iframe {
    padding: 0;
  }

  textarea:focus,
  textarea:not(:empty) {
    border-bottom: 1px solid #eee;
    min-height: 5em;
  }

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
  }
  &.markdown-editor::after {
    padding-top: 66px;
    font-family: monospace;
    font-size: 14px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: end;

  .commit-post-button,
  .preview-post-button {
    background: #59e692;
    color: #09342e;
    border-radius: 40px;
    height: 40px;
    padding: 0 35px;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition:
      background 200ms,
      opacity 200ms;

    &:hover,
    &:focus {
      background: rgb(112 242 164);
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .preview-post-button {
    color: #11181c;
    background: #f1f3f5;
    padding: 0;
    width: 40px;

    &:hover,
    &:focus {
      background: #d7dbde;
      outline: none;
    }
  }

  .upload-image-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f3f5;
    color: #11181c;
    border-radius: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 0;
    border: none;
    cursor: pointer;
    transition:
      background 200ms,
      opacity 200ms;

    &::before {
      font-size: 16px;
    }

    &:hover,
    &:focus {
      background: #d7dbde;
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    span {
      margin-left: 12px;
    }
  }

  .d-inline-block {
    display: flex !important;
    gap: 12px;
    margin: 0 !important;

    .overflow-hidden {
      width: 40px !important;
      height: 40px !important;
    }
  }
`;

const PreviewWrapper = styled.div`
  position: relative;
  padding: var(--padding);
  padding-bottom: calc(40px + (var(--padding) * 2));

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

if (state.image === undefined) {
  State.init({
    image: {},
    text: props.initialText || "",
    mentionsArray: [],
    mentionInput: ""
  });
}

function autoCompleteAccountId(id) {
  // to make sure we update the @ at correct index
  let currentIndex = 0;
  const updatedDescription = state.text.replace(
    /(?:^|\s)(@[^\s]*)/g,
    (match) => {
      if (currentIndex === state.mentionsArray.indexOf(state.mentionInput)) {
        currentIndex++;
        return ` @${id}`;
      } else {
        currentIndex++;
        return match;
      }
    }
  );

  State.update((lastKnownState) => ({
    ...lastKnownState,
    text: updatedDescription,
    showAccountAutocomplete: false
  }));
  setEditorKey((prev) => prev + 1);
}

function onChange(value) {
  // since this fn gets called twice on every text update
  if (value === state.text) {
    return;
  }
  const words = value.split(/\s+/);
  const allMentiones = words
    .filter((word) => word.startsWith("@"))
    .map((mention) => mention.slice(1));
  const newMentiones = allMentiones.filter(
    (item) => !state.mentionsArray.includes(item)
  );
  State.update((lastKnownState) => ({
    ...lastKnownState,
    text: value,
    showAccountAutocomplete: newMentiones?.length > 0,
    mentionsArray: allMentiones,
    mentionInput: newMentiones?.[0] ?? ""
  }));
}

const content = (state.text || state.image.cid || state.image.url) && {
  type: "md",
  text: state.text,
  image: state.image.url
    ? { url: state.image.url }
    : state.image.cid
    ? { ipfs_cid: state.image.cid }
    : undefined
};

const clearCompose = () => {
  State.update({
    image: {},
    text: ""
  });
};

return (
  <Wrapper>
    {state.showPreview ? (
      <PreviewWrapper>
        <Widget
          src="near/widget/v1.Posts.Post"
          props={{
            accountId: accountId,
            blockHeight: "now",
            content
          }}
        />
      </PreviewWrapper>
    ) : (
      <div className="d-flex flex-column gap-3">
        <div className="left">{MemoizedAvatar}</div>
        <div className="right">
          <TextareaWrapper data-value={state.text || ""}>
            <Widget
              key={`markdown-editor-${memoizedEditorKey}`}
              src="mob.near/widget/MarkdownEditorIframe"
              props={{
                initialText: state.text,
                onChange,
                embedCss
              }}
            />
            {autocompleteEnabled && state.showAccountAutocomplete && (
              <div className="pt-1 w-100 overflow-hidden">
                <Widget
                  src="devhub.near/widget/devhub.components.molecule.AccountAutocomplete"
                  props={{
                    term: state.mentionInput,
                    onSelect: autoCompleteAccountId,
                    onClose: () =>
                      State.update({ showAccountAutocomplete: false })
                  }}
                />
              </div>
            )}
          </TextareaWrapper>
        </div>
      </div>
    )}
    <Actions>
      {!state.showPreview && (
        <IpfsImageUpload
          image={state.image}
          className="upload-image-button bi bi-image"
        />
      )}

      <button
        type="button"
        disabled={!state.text}
        className="preview-post-button"
        title={state.showPreview ? "Edit Post" : "Preview Post"}
        onClick={() => State.update({ showPreview: !state.showPreview })}
      >
        {state.showPreview ? (
          <i className="bi bi-pencil" />
        ) : (
          <i className="bi bi-eye-fill" />
        )}
      </button>

      <button
        disabled={!state.text}
        onClick={() => onPostClick(content)}
        className="commit-post-button"
      >
        Post
      </button>
    </Actions>
  </Wrapper>
);
