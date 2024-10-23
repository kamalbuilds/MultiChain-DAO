State.init({
  draggingID: null,
  hovering: false,
  selected: null,
});

const update = (key, value) => {
  State.update({
    [key]: value,
  });
};

const draggables = ["id-2312", "id-3141", "id-0984", "id-1521", "id-9081"];

const data = Social.keys(`nearui.near/widget/*`, "final", {
  return_type: "BlockHeight",
});

if (!data) return "";

return (
  <>
    <div className="d-flex gap-5">
      <div className="w-50">
        <div
          className="fixed-top overflow-scroll w-50 p-3"
          style={{
            marginTop: 120,
            height: "calc(100vh - 120px)",
          }}
        >
          {Object.keys(data["nearui.near"]["widget"]).map((s, i) => (
            <div
              style={{
                userSelect: "none",
              }}
              draggable={true}
              onDragStart={() =>
                update("draggingID", `nearui.near/widget/${s}`)
              }
            >
              <Widget
                key={i}
                src="near/widget/Search.FullPage.ComponentCard"
                props={{
                  src: `nearui.near/widget/${s}`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="d-flex flex-column gap-4 w-50">
        {state.selected &&
          state.selected.map((src, i) => {
            return <Widget src={src} key={i} />;
          })}
        <div
          className="w-100 border-1 border rounded-4 p-3"
          style={{
            height: 200,
            background: "lightblue",
            backgroundColor: state.hovering ? "yellow" : "yellowgreen",
          }}
          onDrop={() => {
            update("selected", [...(state.selected || []), state.draggingID]);
            update("hovering", false);
          }}
          onDragOver={(e) => {
            !state.hovering && update("hovering", true);
          }}
          onDragLeave={(e) => {
            state.hovering && update("hovering", false);
          }}
        >
          Drop here
        </div>
      </div>
    </div>
  </>
);
