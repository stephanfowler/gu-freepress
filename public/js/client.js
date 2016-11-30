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
            isUnderDrag: false
        })
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
            items = this.state.items
                .map(function(item, index) {
                    return <Item
                        key={item.url}
                        index={index}
                        item={item}
                        showLikes={!self.props.asGuPopup}
                        like={self.like}
                        isSelf={item.url === self.props.parentUrl}/>
                });
        return (<div className={"app-container-wrapper" + (this.state.items && this.state.items.length ? '' : ' empty')}>
                <div className="itemsCount">{items.length}</div>
                <div className="windowToggler">⨉</div>
                <div className="pageTitle">
                    <a href="javascript:parent.location = this.location">Open Bubble
                    </a>
                    <svg id="share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 441.1 441.1"><path d="M376.7 172h-72c-9.3 0-17 7.6-17 17s7.7 17 17 17h54.7v201H81.7V206H142c9.4 0 17-7.7 17-17s-7.6-17-17-17H64.5c-9.3 0-16.7 8.5-16.7 17.8v235.7c0 9.4 7.4 15.6 16.7 15.6h312.3c9.3 0 16.7-6 16.7-15.2v-236c0-9.2-7.4-17.7-16.7-17.7z"/><path d="M217.7 299.5c9.4 0 17-7.7 17-17V52l72.6 64.7c3 2.8 7.3 4.3 11.3 4.3 4.8 0 9.3-2 12.7-5.7 6.3-7 5.7-18-1.4-24l-98-87c-6.5-5.6-15.5-5.8-22-.7-3 1.4-5.7 4-7.4 6.8L118 91.7c-6.7 6.5-7 17.3-.5 24 6.5 7 17.3 7 24 .6l59-56.6v222.7c0 9.3 7.7 17 17 17z"/></svg>
                    {self.state.alertText ? <span className='alert'>{self.state.alertText}</span> : null}
                </div>
                <div className='instructions'>Drop related articles below. Upvote the best.</div>                
                <div className={'items' + (this.state.isUnderDrag ? ' pending' : '')}
                        onDrop={this.drop}
                        onDragOver={this.dragOver}
                        onDragLeave={this.dragLeave}>
                    {items}
                    <div key='dropbox' className='dropbox'></div>
                </div>
            </div>)
    }
})

var Suggestions = React.createClass({
    getInitialState: function () {
        return {
            items: this.props.items,
            bubbles: this.props.bubbles
        }
    },
    componentDidMount: function () {
        marmottajax({
            method: "get",
            url: 'http://juicer.api.bbci.co.uk/articles',
            json: true,
            parameters: {
                api_key: 'iCNGx8l4R3Pf2ge9itNAvz3MXOVK9lyG',
                q: 'Ohio ISIS'
            }
        }).then(function (result) {
            console.log(result.hits);
            this.setState({
                items: result.hits
            });
        }.bind(this))
    },
    render: function () {
        return <div id="suggestions" style={
            {top: (this.state.bubbles.length ? (this.state.bubbles.length + 1) * 100 : 175) + 'px'}
        }>
            <h2>Suggestions</h2>
            <ul>
            {this.state.items.map(item => <li>
                <a className="suggestion-link" target="_top" href={item.url + '#open-bubble'}>
                    <div className="suggestion-source">
                        {item.source['source-name']}
                    </div>
                    <div className="suggestion-title">
                            {item.title} 
                    </div>
                </a>
            </li>)}
        </ul>
        </div>
    }
})

Item = React.createClass({
    getInitialState: function () {
        return {
            liked: false
        }
    },

    handleClick: function (event) {
        event.preventDefault();
        this.props.item.likes += 1;
        this.state.liked = true;
        this.forceUpdate();
        this.props.like(this.props.item.url, this.props.item.topic);
    },

    render: function () {
        return <div className={'item' + (this.state.liked ? ' liked' : '') + (this.props.isSelf ? ' is-self' : '')}
                style={{
                    top: (this.props.index * 110) + 'px',
                    zIndex: 1000 - this.props.index
                }}>
            <a href={this.props.item.url + '#open-bubble'} target='_top' className='siteName'>{this.props.item.site_name}</a>
            <a href={this.props.item.url + '#open-bubble'} target='_top' className='image' style={{'backgroundImage': 'url(' + this.props.item.image_url + ')'}}></a>
            <a href={this.props.item.url + '#open-bubble'} target='_top' className='title'>{this.props.item.title}</a>
            {this.props.showLikes ?
                <div className='likes'onClick={this.handleClick}>
                    <span className="number">{this.props.item.likes || ''}</span>
                </div> : null}
        </div>
    }
});

React.render(
    <div>
        <Items
        parentUrl={INITIAL.parentUrl}
        items={INITIAL.items}
        title={INITIAL.title}
        asGuPopup={INITIAL.asGuPopup}/>
        <Suggestions items={[]} bubbles={INITIAL.items} parentUrl={INITIAL.parentUrl} />
    </div>,
    document.getElementById('app-container')
);
