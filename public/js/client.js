
var Items = React.createClass({
    getInitialState: function () {
        return {
            relatedItems: this.props.relatedItems,
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

    apiCallAndRefresh: function (apiAction, data) {
        var self = this;

        $.ajax({
            type: "POST",
            url: '/api/' + apiAction,
            dataType: 'json',
            data: data
        }).done(function (result, statusTxt, xhr) {
            if (xhr.status === 200 && result && result.items) {
                self.setState({
                    relatedItems: result.items
                });
            }
        }).fail(function (result) {
            console.log(result && result.message);
        });
    },

    drop: function (event) {
        var self = this,
            childUrl = event.dataTransfer.getData("text");

        event.preventDefault();

        if (childUrl) {
            this.apiCallAndRefresh('add', {
                parentUrl: self.props.parentUrl,
                childUrl: childUrl
            });
        }

        this.setState({
            isUnderDrag: false
        })
    },

    like: function (url, topic) {
        var self = this;

        this.apiCallAndRefresh('like', {
            url: url,
            topic: topic
        });
    },

    render: function () {
        var self = this;

        return (
            <div id='items-container' onDrop={this.drop} onDragOver={this.dragOver} onDragLeave={this.dragLeave} className={this.state.isUnderDrag ? 'under-drag' : ''}>
                {self.state.relatedItems.map(function(item) {
                    return <Item item={item} like={self.like} isSelf={item.url === self.props.parentUrl}/>
                })}
            </div>
        );
    }
})

Item = React.createClass({
    handleClick: function (event) {
        event.preventDefault();
        this.props.like(this.props.item.url, this.props.item.topic);
    },

    render: function () {
        return <a key={this.props.item.url} className={'item' + (this.props.isSelf ? ' is-self' : '')} href={this.props.item.url}>
            <div className='siteName'>{this.props.item.site_name}</div>
            <div className='image' style={{'background-image': 'url(' + this.props.item.image_url + ')'}}></div>
            <div className='title'>{this.props.item.title}</div>
            <div className='likes'onClick={this.handleClick}>
                <span className="number">{this.props.item.likes || ''}</span>
            </div>
        </a>
    }
});

React.render(
    <Items parentUrl={FREEP.parentUrl} relatedItems={FREEP.relatedItems}/>,
    document.getElementById('app-container')
);
