const url = props.url;
const text = props.text || "";

if (!url) return "";

const facebookURL = new URL("https://www.facebook.com/sharer/sharer.php");
facebookURL.searchParams.append("u", url);

const twitterURL = new URL("https://twitter.com/intent/tweet");
twitterURL.searchParams.append("text", text);
twitterURL.searchParams.append("url", url);

const linkedinURL = new URL("https://www.linkedin.com/shareArticle");
linkedinURL.searchParams.append("mini", "true");
linkedinURL.searchParams.append("url", url);
linkedinURL.searchParams.append("title", text);

const telegramURL = new URL("https://t.me/share/url");
telegramURL.searchParams.append("url", url);
telegramURL.searchParams.append("text", text);

const socialMedia = [
  {
    name: "Facebook",
    link: facebookURL.toString(),
    icon: "bi bi-facebook"
  },
  {
    name: "Twitter",
    link: twitterURL.toString(),
    icon: "bi bi-twitter"
  },
  {
    name: "LinkedIn",
    link: linkedinURL.toString(),
    icon: "bi bi-linkedin"
  },
  {
    name: "Telegram",
    link: telegramURL.toString(),
    icon: "bi bi-telegram"
  }
];

const Wrapper = styled.div`
  .social_button {
    height: 2.5em;
    width: 2.5em;
    border-radius: 50%;
    background: #eee;
    color: #000;
    border: none;
    transition: all 200ms ease;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
  }

  .social_url {
    background: #eee;
    padding: 8px 12px;
    display: grid;
    grid-template-columns: 1fr 120px;
    align-items: center;
    gap: 6px;

    & > span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 300px;
    }

    & > button {
      font-size: 16px;
      border: none;
      background: rgb(68, 152, 224);
      color: #fff;
    }
  }
`;

State.init({
  copied: false
});

return (
  <Wrapper className="p-4">
    <h3 className="mb-4">Share with friends</h3>
    <div className="d-flex gap-4 justify-content-between mb-4">
      {socialMedia.map((item, index) => (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share to ${item.name}`}
          className="social_button"
        >
          <i className={item.icon}></i>
        </a>
      ))}
    </div>
    <div className="social_url">
      <span>{url}</span>
      <button
        onClick={() => {
          clipboard.writeText(url);
          State.update({
            copied: true
          });
          setTimout(() => {
            State.update({
              copied: false
            });
          }, 2000);
        }}
      >
        <i
          className={state.copied ? "bi bi-clipboard-check" : "bi bi-clipboard"}
        ></i>
        {state.copied ? "Copied!" : "Copy"}
      </button>
    </div>
  </Wrapper>
);
