var Items = React.createClass({
    displayName: "Items",

    getInitialState: function () {
        return {
            items: this.props.items,
            isUnderDrag: false
        };
    },

    dragOver: function (event) {
        event.preventDefault();
        this.setState({
            isUnderDrag: true
        });
    },

    dragLeave: function (event) {
        event.preventDefault();
        this.setState({
            isUnderDrag: false
        });
    },

    api: function (apiAction, data, alertText) {
        var self = this;

        self.setState({ alertText: alertText });

        marmottajax({
            method: "post",
            url: '/api/' + apiAction,
            json: true,
            parameters: data
        }).then(function (result) {
            if (result && result.items) {
                self.setState({
                    items: result.items
                });
            }
            self.clearAlert();
        }).error(function (result) {
            self.clearAlert();
        });
    },

    clearAlert: function () {
        var self = this;

        setTimeout(function () {
            self.setState({ alertText: null });
        }, 500);
    },

    drop: function (event) {
        var self = this,
            childUrl = event.dataTransfer.getData("text");

        event.preventDefault();

        if (childUrl) {
            this.api('add', {
                parentUrl: self.props.parentUrl,
                childUrl: childUrl
            }, 'fetching...');
        }

        this.setState({
            isUnderDrag: false
        });
    },

    like: function (url, topic) {
        var self = this;

        this.api('like', {
            url: url,
            topic: topic
        }, null);
    },

    render: function () {
        var self = this,
            items = this.state.items.map(function (item, index) {
            return React.createElement(Item, {
                key: item.url,
                index: index,
                item: item,
                showLikes: !self.props.asGuPopup,
                like: self.like,
                isSelf: item.url === self.props.parentUrl });
        });

        return React.createElement(
            "div",
            { className: "app-container-wrapper" + (this.state.items && this.state.items.length ? '' : ' empty') },
            React.createElement(
                "div",
                { className: "itemsCount" },
                items.length
            ),
            React.createElement(
                "div",
                { className: "windowToggler" },
                "\u2A09"
            ),
            React.createElement(
                "div",
                { className: "pageTitle" },
                React.createElement(
                    "a",
                    { href: "javascript:window.open(this.location)" },
                    "Open Bubble"
                ),
                React.createElement(
                    "svg",
                    { id: "share-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 441.1 441.1" },
                    React.createElement("path", { d: "M376.7 172h-72c-9.3 0-17 7.6-17 17s7.7 17 17 17h54.7v201H81.7V206H142c9.4 0 17-7.7 17-17s-7.6-17-17-17H64.5c-9.3 0-16.7 8.5-16.7 17.8v235.7c0 9.4 7.4 15.6 16.7 15.6h312.3c9.3 0 16.7-6 16.7-15.2v-236c0-9.2-7.4-17.7-16.7-17.7z" }),
                    React.createElement("path", { d: "M217.7 299.5c9.4 0 17-7.7 17-17V52l72.6 64.7c3 2.8 7.3 4.3 11.3 4.3 4.8 0 9.3-2 12.7-5.7 6.3-7 5.7-18-1.4-24l-98-87c-6.5-5.6-15.5-5.8-22-.7-3 1.4-5.7 4-7.4 6.8L118 91.7c-6.7 6.5-7 17.3-.5 24 6.5 7 17.3 7 24 .6l59-56.6v222.7c0 9.3 7.7 17 17 17z" })
                ),
                self.state.alertText ? React.createElement(
                    "span",
                    { className: "alert" },
                    self.state.alertText
                ) : null
            ),
            React.createElement(
                "div",
                { className: "instructions" },
                "Drop related articles below. Upvote the best."
            ),
            React.createElement(
                "div",
                { className: 'items' + (this.state.isUnderDrag ? ' pending' : ''),
                    onDrop: this.drop,
                    onDragOver: this.dragOver,
                    onDragLeave: this.dragLeave },
                items,
                React.createElement("div", { key: "dropbox", className: "dropbox" })
            )
        );
    }
});

Item = React.createClass({
    displayName: "Item",

    getInitialState: function () {
        return {
            liked: false
        };
    },

    handleClick: function (event) {
        event.preventDefault();
        this.props.item.likes += 1;
        this.state.liked = true;
        this.forceUpdate();
        this.props.like(this.props.item.url, this.props.item.topic);
    },

    render: function () {
        return React.createElement(
            "div",
            { className: 'item' + (this.state.liked ? ' liked' : '') + (this.props.isSelf ? ' is-self' : ''),
                style: {
                    top: this.props.index * 110 + 'px',
                    zIndex: 1000 - this.props.index
                } },
            React.createElement(
                "a",
                { href: this.props.item.url + '#open-bubble', target: "_top", className: "siteName" },
                this.props.item.site_name
            ),
            React.createElement("a", { href: this.props.item.url + '#open-bubble', target: "_top", className: "image", style: { 'backgroundImage': 'url(' + this.props.item.image_url + ')' } }),
            React.createElement(
                "a",
                { href: this.props.item.url + '#open-bubble', target: "_top", className: "title" },
                this.props.item.title
            ),
            this.props.showLikes ? React.createElement(
                "div",
                { className: "likes", onClick: this.handleClick },
                React.createElement(
                    "span",
                    { className: "number" },
                    this.props.item.likes || ''
                )
            ) : null
        );
    }
});

React.render(React.createElement(Items, {
    parentUrl: INITIAL.parentUrl,
    items: INITIAL.items,
    title: INITIAL.title,
    asGuPopup: INITIAL.asGuPopup }), document.getElementById('app-container'));
