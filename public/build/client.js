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

    like: function (childUrl) {
        var self = this;

        this.api('like', {
            parentUrl: self.props.parentUrl,
            childUrl: childUrl
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
                this.props.title + ' Open Bubble',
                self.state.alertText ? React.createElement(
                    "span",
                    { className: "alert" },
                    self.state.alertText
                ) : null
            ),
            React.createElement(
                "div",
                { className: "instructions" },
                "Disagree? Drag & drop alternative articles here"
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
        this.props.like(this.props.item.url);
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
                { href: this.props.item.url, target: "_top", className: "siteName" },
                this.props.item.site_name
            ),
            React.createElement("a", { href: this.props.item.url, target: "_top", className: "image", style: { 'backgroundImage': 'url(' + this.props.item.image_url + ')' } }),
            React.createElement(
                "a",
                { href: this.props.item.url, target: "_top", className: "title" },
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
