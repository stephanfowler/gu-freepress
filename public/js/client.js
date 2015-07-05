var Items = React.createClass({
    getInitialState: function () {
        return {
            items: this.props.items,
            isUnderDrag: false
        }
    },

    dragOver: function (event) {
        event.preventDefault();
        this.setState({
            isUnderDrag: true
        })
    },

    dragLeave: function (event) {
        event.preventDefault();
        this.setState({
            isUnderDrag: false
        })
    },

    api: function (apiAction, data, alertText) {
        var self = this;

        self.setState({alertText: alertText});

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
        })
        .error(function (result) {
            self.clearAlert();
        });
    },

    clearAlert: function () {
        var self = this;

        setTimeout(function() {
            self.setState({alertText: null});
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
            zIndexDirection: 1,
            isUnderDrag: false
        })
    },

    like: function (url, topic) {
        var self = this;

        this.api('like', {
            url: url,
            topic: topic
        }, null);

        this.setState({
            zIndexDirection: -1
        })
    },

    render: function () {
        var self = this,
            items = this.state.items
                .map(function(item, index) {
                    return <Item
                        key={item.url}
                        index={index}
                        zIndexDirection={self.state.zIndexDirection || 1}
                        item={item}
                        like={self.like}
                        isSelf={item.url === self.props.parentUrl}/>
                });

        return (
            <div className={this.state.items && this.state.items.length ? '' : 'empty'}>
                <div className="pageTitle">
                    Story Horde
                    {self.state.alertText ? <span className='alert'>{self.state.alertText}</span> : null}
                </div>
                <div className='instructions'>Drop related articles below. Upvote the best.</div>                
                <div className={'items' + (this.state.isUnderDrag || self.state.alertText ? ' under-drag' : '')}
                        onDrop={this.drop}
                        onDragOver={this.dragOver}
                        onDragLeave={this.dragLeave}>
                    {items}
                    <div key='dropbox' className='dropbox'></div>
                </div>
            </div>
        );
    }
})

Item = React.createClass({
    handleClick: function (event) {
        event.preventDefault();
        this.props.item.likes += 1;
        this.props.item.highlight = true;
        this.forceUpdate();
        this.props.like(this.props.item.url, this.props.item.topic);
    },

    render: function () {
        return <div className={'item' + (this.props.item.highlight ? ' highlight' : '') + (this.props.isSelf ? ' is-self' : '')}
                style={{
                    top: (this.props.index * 110) + 'px',
                    zIndex: 1000 + this.props.index * this.props.zIndexDirection
                }}>
            <a href={this.props.item.url} target='_top' className='siteName'>{this.props.item.site_name}</a>
            <a href={this.props.item.url} target='_top' className='image' style={{'backgroundImage': 'url(' + this.props.item.image_url + ')'}}></a>
            <a href={this.props.item.url} target='_top' className='title'>{this.props.item.title}</a>
            <div className='likes'onClick={this.handleClick}>
                <span className="number">{this.props.item.likes || ''}</span>
            </div>
        </div>
    }
});

React.render(
    <Items parentUrl={INITIAL.parentUrl} items={INITIAL.items}/>,
    document.getElementById('app-container')
);
