const getFollowedDAOs = (accountId) => {
  let following = Social.keys(`${accountId}/graph/follow/*`, "final", {
    return_type: "BlockHeight",
  });

  if (following === null) return null;

  following = Object.keys(following[accountId].graph.follow || {}).filter(
    (account) => account.endsWith(".sputnik-dao.near"),
  );
  return following;
};
