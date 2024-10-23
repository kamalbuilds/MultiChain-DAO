const sizes = ["sm", "md", "lg"];
const variants = [
  "primary",
  "secondary",
  "danger",
  "success",
  "info",
  "white",
  "black",
  "disabled",
];

return (
  <div className="d-flex flex-column gap-4 py-4">
    {variants.map((variant) => (
      <div className="d-flex flex-column gap-2">
        {sizes.map((size) => (
          <div className="d-flex flex-row gap-1">
            <Widget
              src="/*__@appAccount__*//widget/Element.Badge"
              props={{
                children: (
                  <>
                    {variant}
                    <Widget
                      src="/*__@appAccount__*//widget/Element.Badge"
                      props={{
                        children: "0",
                        variant: "white circle round",
                        size: "sm",
                      }}
                    />
                  </>
                ),
                variant,
                size,
              }}
            />
            <Widget
              src="/*__@appAccount__*//widget/Element.Badge"
              props={{
                children: variant,
                variant: `${variant} round`,
                size,
              }}
            />
            <Widget
              src="/*__@appAccount__*//widget/Element.Badge"
              props={{
                children: "outline",
                variant: `${variant} outline`,
                size,
              }}
            />
            <Widget
              src="/*__@appAccount__*//widget/Element.Badge"
              props={{
                children: "outline",
                variant: `${variant} outline round`,
                size,
              }}
            />
          </div>
        ))}
      </div>
    ))}
  </div>
);
