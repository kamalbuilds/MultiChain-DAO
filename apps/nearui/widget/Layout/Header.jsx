/**
  To make sure that the sidebar displays correctly, you need to add some bootstrap classes to the parent component.
 
  Add the following className to the parent component: "row"
  and add the following CSS to the content component: "col"

Example:

return (
  <div className="row">
    <Widget src="nearui.near/widget/Common.Layout.Header" />
    <div className="col">home</div>
  </div>
);
 
*/

const hasSidebar = props.hasSidebar ?? true;
const logo = props.logo ?? "NearUI";
const items = props.items ?? [
  [
    {
      title: "Home",
      icon: <i className="bi bi-house-door"></i>,
      active: true,
      href: "?page=home",
      onClick: () => console.log({ page: "home" }),
    },
  ],
  [
    {
      title: "DAOs",
      icon: <i class="bi bi-grid"></i>,
    },
    {
      title: "My DAOs",
    },
  ],
  {
    title: "Hidden",
    hidden: true,
  },
];

State.init({
  sidebarExpanded: false,
});

const Header = styled.div`
  border-bottom: 1px solid #e5e5e5;

  .sidebar-toggle {
    display: none;
  }
  @media (max-width: 768px) {
    .sidebar-toggle {
      display: block;
    }
  }
`;

const Sidebar = styled.div`
  height: 100%;
  transition: all 0.5s ease-in-out;
  max-width: 300px;
  background: #fff;
  border-right: 1px solid #e5e5e5;

  &.collapsed {
    padding-right: 26px;
    max-width: 94px;
  }

  @media (max-width: 768px) {
    position: fixed !important;
    top: 0;
    bottom: 0;
    z-index: 10000;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &.collapsed {
      left: -400px;
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    width: 100%;
    max-width: 240px;
  }

  .group {
    width: 100%;
  }

  li {
    background: #fff;
    cursor: pointer;
    border-radius: 8px;
    width: 100%;
    transition: all 100ms ease-in-out;

    div,
    a {
      padding: 8px 26px;
      color: #000 !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    i {
      font-size: 19px;
    }
  }

  li:hover {
    background-color: rgba(68, 152, 224, 0.1);

    * {
      color: #4498e0 !important;
    }
  }

  li:active {
    background-color: rgba(68, 152, 224, 0.12);
    * {
      color: #4498e0 !important;
    }
  }

  li.active {
    background-color: rgba(68, 152, 224, 0.1);

    * {
      color: #4498e0 !important;
    }
  }

  &.collapsed {
    li {
      width: 100% !important;

      div,
      a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        text-align: center;
        gap: 4px;
      }
    }

    li .title {
      display: none;
    }

    .group {
      li:not(:first-child) {
        display: none;
      }
    }
  }
`;

const Toggle = styled.div`
  position: absolute;
  top: 10px;
  right: -20px;
  z-index: 10;
  height: 40px;
  width: 40px;
  background: #4498e0;
  color: #fff;
  border-radius: 6px;
  display: grid;
  place-items: center;

  @media (max-width: 768px) {
    bottom: 100px;
    top: auto;
  }
`;

const MobileToggle = styled.div`
  height: 40px;
  width: 40px;
  background: #4498e0;
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

return (
  <>
    <Header className="d-flex justify-content-between align-items-center py-3 px-md-3 m-0 flex-row">
      <MobileToggle
        className="sidebar-toggle btn btn-outline-light"
        onClick={() =>
          State.update({ sidebarExpanded: !state.sidebarExpanded })
        }
      >
        <i className="bi bi-list"></i>
      </MobileToggle>
      {logo}
      <span
        style={{
          border: context.accountId ? "1px solid #4498E0" : "1px solid #E5E5E5",
          borderRadius: "400px",
          padding: context.accountId
            ? "8px 20px 8px 14px"
            : "8px 20px 8px 20px",
          background: context.accountId ? "rgba(236, 245, 252, 0.40)" : "#fff",
        }}
      >
        {context.accountId ? (
          <Widget
            src="/*__@appAccount__*//widget/Element.User"
            props={{
              accountId: context.accountId,
            }}
          />
        ) : (
          "Not connected"
        )}
      </span>
    </Header>
    <Sidebar
      className={[
        "position-relative col-sm",
        !state.sidebarExpanded && "collapsed",
      ].join(" ")}
    >
      <Toggle
        role="button"
        onClick={() =>
          State.update({ sidebarExpanded: !state.sidebarExpanded })
        }
      >
        {state.sidebarExpanded ? (
          <i className="bi bi-chevron-left"></i>
        ) : (
          <i className="bi bi-chevron-right"></i>
        )}
      </Toggle>
      <ul className="pt-4">
        {items.map((item, i) => {
          if (Array.isArray(item)) {
            return (
              <div key={i} className="group">
                <ul>
                  {item.map((subItem, j) => {
                    if (subItem.hidden) return null;
                    return (
                      <li
                        key={j}
                        className={[
                          subItem.active && "active",
                          j > 0 && "ms-auto",
                        ].join(" ")}
                        style={{
                          width: j > 0 ? "85%" : "",
                        }}
                      >
                        {subItem.href ? (
                          <a href={subItem.href} onClick={subItem.onClick}>
                            <span className="icon">{subItem.icon}</span>
                            <span className="title">{subItem.title}</span>
                          </a>
                        ) : (
                          <div onClick={subItem.onClick} role="button">
                            <span className="icon">{subItem.icon}</span>
                            <span className="title">{subItem.title}</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          } else {
            if (item.hidden) return null;
            return (
              <li key={i} className={item.active && "active"}>
                {item.href ? (
                  <a href={item.href} onClick={item.onClick}>
                    <span className="icon">{item.icon}</span>
                    <span className="title">{item.title}</span>
                  </a>
                ) : (
                  <div onClick={item.onClick} role="button">
                    <span className="icon">{item.icon}</span>
                    <span className="title">{item.title}</span>
                  </div>
                )}
              </li>
            );
          }
        })}
      </ul>
    </Sidebar>
  </>
);
