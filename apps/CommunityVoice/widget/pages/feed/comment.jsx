const { accountId, blockHeight, Config, Post, community } = props;
const update = (s) => State.update(s);
const refresh = (ms) => setTimeout(() => update({ rd: Math.random() }), ms);

State.init({});

// -- Filters
if (Array.isArray(community.rules.commenting.SBTs)) {
    // author should have the SBTs
    let isValid = false;

    community.rules.commenting.SBTs.forEach((SBT) => {
        const allSBTs = Near.view(Config.SBTRegistry, "sbt_tokens_by_owner", {
            account: accountId
        });
        if (allSBTs === null) return "";
        const hasSBT = allSBTs.find((s) => s[0] === SBT)[1].length > 0;
        isValid = isValid && hasSBT;
    });
    if (!isValid) {
        return "";
    }
}

// --
const post = Post.get(accountId, blockHeight, Config.commentDataKey);
const likesByUsers = Post.getLikes(
    accountId,
    blockHeight,
    Config.commentDataKey
);
const reactionsByUsers = Post.getReactions(
    accountId,
    blockHeight,
    Config.commentDataKey
);

if (post === null) {
    refresh(500);
    return (
        <div>
            <Widget src="nearui.near/widget/Feedback.Spinner" />
        </div>
    );
}

if (likesByUsers === null || reactionsByUsers === null) {
    refresh(500);
    return <>Loading LIKES</>;
}

if (state.forcedLike !== undefined) {
    if (state.forcedLike) {
        likesByUsers[context.accountId] = likesByUsers[context.accountId] || {
            accountId: context.accountId,
            value: {
                type: "like"
            }
        };
    } else {
        delete likesByUsers[context.accountId];
    }
}

post.stats = {
    likes: Object.keys(likesByUsers).length,
    reactions: {}
};

Object.entries(reactionsByUsers).forEach(([_, reaction]) => {
    post.stats.reactions[reaction] = 1 + (post.stats.reactions[reaction] || 0);
});

post.reaction = state.forcedReaction ?? reactionsByUsers[context.accountId];

if (state.forcedReaction !== undefined) {
    if (post.reaction) {
        post.stats.reactions[post.reaction] =
            (post.stats.reactions[post.reaction] || 0) - 1;
    }
    post.stats.reactions[state.forcedReaction] =
        (post.stats.reactions[state.forcedReaction] || 0) + 1;
}

post.liked = !!likesByUsers[context.accountId];

const on = {
    like: () => {
        Post.like(
            {
                postAuthor: accountId,
                postBlockHeight: blockHeight,
                dataKey: Config.commentDataKey
            },
            post.liked ? true : false,
            () => update({ forcedLike: post.liked ? false : true }),
            () => console.log("canceled")
        );
    },
    react: (newReaction) => {
        Post.react(
            {
                postAuthor: accountId,
                postBlockHeight: blockHeight,
                dataKey: Config.commentDataKey
            },
            newReaction,
            () => update({ forcedReaction: newReaction }),
            () => console.log("canceled")
        );
    }
};

return (
    <Widget
        src="/*__@replace:nui__*//widget/Social.PostCard"
        props={{
            post,
            on,
            containerProps: {
                className: "mb-4"
            }
        }}
    />
);
