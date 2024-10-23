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

const ndcTrustDaoId = "ndctrust.sputnik-dao.near";
let { page, tab, daoId, house } = props;
if (!page) {
  page = "social-feed";
}
const currentLink = "#//*__@appAccount__*//widget/home";

State.init({
  activePage: page,
  activeTab: tab,
  activeDaoId: daoId
});

if (
  page !== state.activePage ||
  tab !== state.activeTab ||
  daoId !== state.activeDaoId
) {
  State.update({
    activePage: page,
    activeTab: tab,
    activeDaoId: daoId
  });
}

page = state.activePage;

const router = {
  params: { page, tab, daoId, house },
  navigate: (newParams) => {
    router.params = {
      ...newParams
    };
    State.update({
      activePage: router.params.page,
      activeTab: router.params.tab,
      activeDaoId: router.params.daoId
    });
  }
};

const pages = [
  [
    {
      title: "Home",
      icon: <i className="bi bi-house-door"></i>,
      active: page === "home",
      href: currentLink + "?page=home",
      onClick: () => router.navigate({ page: "home" }),
      widgetName: "ProposalsFeed.index",
      defaultProps: {}
    },
    {
      title: "Social feed",
      active: page === "social-feed",
      href: currentLink + "?page=social-feed",
      onClick: () => router.navigate({ page: "social-feed" }),
      widgetName: "Feed.index",
      defaultProps: {}
    },
    {
      title: "My proposals",
      active: page === "my-proposals",
      href: currentLink + "?page=my-proposals",
      onClick: () => router.navigate({ page: "my-proposals" }),
      widgetName: "MyProposals.index",
      defaultProps: {}
    }
  ],
  [
    {
      title: "Government",
      icon: <i className="bi bi-bank"></i>,
      active: page.split("-")[0] === "congress",
      href: currentLink + "?page=congress",
      onClick: () => router.navigate({ page: "congress" }),
      widgetName: "Congress.index"
    },
    {
      title: "HoM",
      active: page === "congress" && router.params.house === "hom",
      href: currentLink + `?page=congress&house=hom`,
      onClick: () => router.navigate({ page: "congress", house: "hom" }),
      widgetName: "DAO.index"
    },
    {
      title: "CoA",
      active: page === "congress" && router.params.house === "coa",
      href: currentLink + `?page=congress&house=coa`,
      onClick: () => router.navigate({ page: "congress", house: "coa" }),
      widgetName: "DAO.index"
    },
    {
      title: "TC",
      active: page === "congress" && router.params.house === "tc",
      href: currentLink + `?page=congress&house=tc`,
      onClick: () => router.navigate({ page: "congress", house: "tc" }),
      widgetName: "DAO.index"
    },
    {
      title: "Voting Body",
      active: page === "congress" && router.params.house === "vb",
      href: currentLink + `?page=congress&house=vb`,
      onClick: () => router.navigate({ page: "congress", house: "vb" }),
      widgetName: "DAO.index"
    },
    {
      title: "NDC Trust",
      active: page === "dao" && daoId === ndcTrustDaoId,
      href: currentLink + `?page=dao&daoId=${ndcTrustDaoId}`,
      onClick: () => router.navigate({ page: "dao", daoId: ndcTrustDaoId }),
      widgetName: "DAO.index"
    }
  ],
  [
    {
      title: "DAOs",
      icon: <i class="bi bi-grid"></i>,
      active: page === "daos",
      href: currentLink + "?page=daos",
      onClick: () => router.navigate({ page: "daos" }),
      widgetName: "DAOs.index",
      defaultProps: {}
    },
    {
      title: "My DAOs",
      active: page === "my-daos",
      href: currentLink + "?page=my-daos",
      widgetName: "DAOs.index",
      onClick: () => router.navigate({ page: "my-daos" }),
      defaultProps: {
        filter: "myDAOs"
      }
    },
    {
      title: "Following",
      active: page === "daos-following",
      href: currentLink + "?page=daos-following",
      widgetName: "DAOs.index",
      onClick: () => router.navigate({ page: "daos-following" }),
      defaultProps: {
        filter: "followedDAOs"
      }
    },
    {
      title: "All",
      active: page === "daos",
      href: currentLink + "?page=daos",
      widgetName: "DAOs.index",
      onClick: () => router.navigate({ page: "daos" }),
      defaultProps: {}
    }
  ],
  {
    title: "Community Voice",
    icon: <i class="bi bi-chat-dots"></i>,
    active: page === "communityVoice",
    href: currentLink + "?page=communityVoice",
    onClick: () => router.navigate({ page: "communityVoice" }),
    widgetName: "CommunityVoice",
    defaultProps: {}
  },
  {
    title: "Actions library",
    icon: <i class="bi bi-code-slash"></i>,
    active: page === "actions",
    href: currentLink + "?page=actions",
    onClick: () => router.navigate({ page: "actions" }),
    widgetName: "Actions.index"
  },
  {
    title: "Create DAO",
    active: page === "create-dao",
    href: currentLink + "?page=create-dao",
    onClick: () => router.navigate({ page: "create-dao" }),
    widgetName: "CreateDAO.index",
    hidden: true
  },
  {
    title: "DAO",
    active: page === "dao",
    href: currentLink + "?page=dao",
    onClick: (daoId, tab) => router.navigate({ page: "dao", daoId, tab }),
    widgetName: "DAO.index",
    hidden: true
  },
  {
    title: "Voting History",
    active: page === "votinghistory",
    href: currentLink + "?page=votinghistory",
    onClick: (daoId, tab) => router.navigate({ page: "votinghistory" }),
    widgetName: "VotingHistory.index",
    hidden: true
  }
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

const pageContent = activePage ? (
  <Widget
    src={"/*__@appAccount__*//widget/" + activePage.widgetName}
    props={{
      router,
      ...activePage.defaultProps,
      ...props
    }}
  />
) : (
  "404"
);

const Root = styled.div`
  font-family:
    "Open Sans",
    "Manrope",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    "Noto Sans",
    "Liberation Sans",
    Arial,
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
  font-size: 16px;
  line-height: 1.5;
  color: #000;

  a {
    color: #000;
    text-decoration: none;
  }

  a:hover {
    color: #4498e0;
  }

  .ndc-card {
    border-radius: 16px;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0 1px 3px,
      rgba(0, 0, 0, 0.05) 0 1px 20px;
    background-color: #fff;
  }
`;
return (
  <Root className="row">
    <Widget src={`nearui.near/widget/Typography.OpenSansFont`} />

    <Widget
      src="/*__@appAccount__*//widget/Common.Layout.Header"
      props={{
        items: pages
      }}
    />
    {activePage.widgetName === "Congress.index" ? (
      <div className="col">{pageContent}</div>
    ) : (
      <div
        className="col ms-sm-4 ps-lg-5 py-3 py-md-5"
        style={{ width: "65%" }}
      >
        {pageContent}
      </div>
    )}
  </Root>
);
