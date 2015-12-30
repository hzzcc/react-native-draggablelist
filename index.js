/**
 * 可拖动
 */
'use strict';

var React = require('react-native');
var {
    View,
    ScrollView,
    LayoutAnimation,
    PropTypes,
    } = React;

var AnimatedCell = require('./animatedCell');
var invariant = require('invariant');
var TimerMixin = require('react-timer-mixin');

var DragableList = React.createClass({
    mixins: [TimerMixin],

    propTypes: {
        dataSource: PropTypes.array, //数据
        component: PropTypes.func.isRequired, //cell
        cellProps: PropTypes.object, //cell props
        shouldUpdateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), //需要更新的cell id
        onMove: PropTypes.func, //移动后的keys
        keys: PropTypes.array, //排序好的数组
    },

    getDefaultProps() {
        return {
            dataSource: [],
        };
    },

    getInitialState() {
        var keys = [];
        var keyGroups = {};
        var dataSource = this.props.dataSource || [];
        if (this.props.keys && this.props.keys.length > 0) {
            keys = this.props.keys;
            for (var i = 0; i < dataSource.length; i++) {
                var item = dataSource[i];
                var key = item.id.toString();
                keyGroups[key] = item;
            }
        }else{
            for (var i = 0; i < dataSource.length; i++) {
                var item = dataSource[i];
                var key = item.id.toString();
                keys[i] = key;
                keyGroups[key] = item;
            }
        }

        invariant(keys.length == this.props.dataSource.length, 'dataSource length should be equal to keys length');

        return {
            keys: keys,
            key_groups: keyGroups,
            restLayouts: [],
            scrollable: true,
            shouldUpdate: false,
        }
    },

    componentWillReceiveProps(nextProps) {
        var {dataSource, keys} = nextProps;

        if (keys && dataSource) {
            invariant(keys.length == dataSource.length, 'dataSource length should be equal to keys length');
            this.setState({
                dataSource,
                keys
            })
        }else if (keys && !dataSource) {
            this.setState({
                keys
            })
        }else if (dataSource) {
            this.setState({
                dataSource,
            })
        }

    },

    setTimeoutId: null,
    //animate
    _onMove(position: Point): void {
        var newKeys = moveToClosest(this.state, position);
        if (newKeys !== this.state.keys) {
            LayoutAnimation.easeInEaseOut();
            this.setState({keys: newKeys});
            this.props.onMove && this.props.onMove(newKeys);
        }
    },

    toggleScroll: function (can) {
        this.setState({
            scrollable: can
        });
    },

    render() {
        var content = <View />;

        var CellComponent = this.props.component;

        var cellProps = this.props.cellProps;

        var shouldUpdateId = null;
        if (this.props.shouldUpdateId !== null && this.props.shouldUpdateId !== undefined) {
            shouldUpdateId = this.props.shouldUpdateId.toString();
        }

        if (this.state.keys.length > 0) {

            content = this.state.keys.map((key, idx) => {
                if (!key) return;
                var row_data = this.state.key_groups[key];

                var shouldUpdate = this.state.shouldUpdate || (shouldUpdateId === key);
                if (key === this.state.activeKey) {
                    return (
                        <AnimatedCell
                            key={key + 'd'}
                            dummy={true}
                            cellProps={cellProps}
                            cellComponent={this.props.component}
                            rowData={row_data}
                            shouldUpdate={shouldUpdate}
                            />
                    );
                } else {
                    if (!this.state.restLayouts[idx]) {
                        var onLayout = function(index, e) {
                            var layout = e.nativeEvent.layout;
                            this.setState((state) => {
                                state.restLayouts[index] = layout;
                                return state;
                            });
                        }.bind(this, idx);
                    }
                    return (
                        <AnimatedCell
                            key={key}
                            onLayout={onLayout}
                            restLayout={this.state.restLayouts[idx]}
                            onActivate={() => {
                                this.setState({
                                    shouldUpdate: true,
                                    activeKey: key,
                                    activeInitialLayout: this.state.restLayouts[idx],
                                })
                            }}
                            toggleScroll={this.toggleScroll}
                            cellProps={cellProps}
                            cellComponent={this.props.component}
                            rowData={row_data}
                            shouldUpdate={shouldUpdate}
                            />
                    );
                }
            });
            if (this.state.activeKey) {
                var row_data = this.state.key_groups[this.state.activeKey];
                var shouldUpdate = this.state.shouldUpdate || (shouldUpdateId === this.state.activeKey);
                content.push(
                    <AnimatedCell
                        key={this.state.activeKey}
                        restLayout={this.state.activeInitialLayout}
                        onMove={this._onMove}
                        onDeactivate={() => {
                            this.setState({
                                shouldUpdate: false,
                                activeKey: undefined
                            });
                        }}
                        toggleScroll={this.toggleScroll}
                        cellProps={cellProps}
                        cellComponent={this.props.component}
                        rowData={row_data}
                        shouldUpdate={shouldUpdate}
                        />
                );
            }
        }

        return (
            <View style={{flex: 1}}}>
                <ScrollView
                    style={{flex: 1}}
                    scrollEnabled={this.state.scrollable}
                    showsVerticalScrollIndicator={false}
                    contentInset={{bottom: 0}}
                    automaticallyAdjustContentInsets={false}
                    >
                    {content}
                </ScrollView>
            </View>
        )
    }
});

function distance(p1, p2) {
    if (!p1 || !p2) return 0;
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}

function moveToClosest({activeKey, keys, restLayouts}, position) {
    var activeIdx = -1;
    var closestIdx = activeIdx;
    var minDist = Infinity;
    var newKeys = [];
    keys.forEach((key, idx) => {
        var dist = distance(position, restLayouts[idx]);
        if (key === activeKey) {
            idx = activeIdx;
        } else {
            newKeys.push(key);
        }
        if (dist < minDist) {
            minDist = dist;
            closestIdx = idx;
        }
    });
    if (closestIdx === activeIdx) {
        return keys;
    } else {
        newKeys.splice(closestIdx, 0, activeKey);
        return newKeys;
    }
}

module.exports = DragableList;
