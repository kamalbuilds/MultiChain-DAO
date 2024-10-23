/** Containes the app router **/

const page = props.page ?? "home";

State.init({
  activePage: page,
});

if (page !== state.activePage) {
  State.update({
    activePage: page,
  });
}
page = state.activePage;

const router = {
  params: {
    page: page,
  },
  navigate: (newParams) => {
    router.params = {
      ...newParams,
    };
    State.update({
      activePage: router.params.page,
    });
  },
};

const pages = [
  {
    title: "home",
    icon: <i class="bi bi-house"></i>,
    widget: "pages.feed.index",
    active: page === "home",
    defaultProps: {},
  },
];

let activePage = null;
pages.find((page) => {
  if (Array.isArray(page)) {
    return page.find((subPage) => {
      if (subPage.active) {
        activePage = subPage;
        return true;
      }
      return false;
    });
  }
  if (page.active) {
    activePage = page;
    return true;
  }
  return false;
});

return (
  <div className="row">
    <Widget
      src="/*__@replace:nui__*//widget/Layout.Header"
      props={{
        items: pages,
        logo: (
          <img
            src="https://ipfs.near.social/ipfs/bafkreifhkslni6dlocxya35vjft3fefk2am5uzkagmjjzobdjqlhrnbjz4"
            alt="Community Voice Logo"
            height="50px"
          />
        ),
      }}
    />
    <div className="col bg-light min-vh-75">
      {activePage ? (
        <Widget
          src="/*__@appAccount__*//widget/Provider"
          props={{
            widget: "/*__@appAccount__*//widget/" + activePage.widget,
            router,
            ...activePage.defaultProps,
            ...props,
          }}
        />
      ) : (
        "404"
      )}
    </div>
  </div>
);
