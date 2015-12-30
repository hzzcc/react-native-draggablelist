/**
 * dragableCell
 */
'use strict';

var React = require('react-native');
var {
    Animated,
    LayoutAnimation,
    PanResponder,
    StyleSheet,
    View,
    } = React;

var TimerMixin = require('react-timer-mixin');

var AnimateCell = React.createClass({

    mixins: [TimerMixin],

    getInitialState: function () {
        return {
            isActive: false,
            pan: new Animated.ValueXY(), // 减少样本矢量.
            pop: new Animated.Value(0),  // 初值.
            shouldUpdate: false,
        };
    },

    shouldComponentUpdate(nextProps) {
        if (nextProps.shouldUpdate) {
            return true;
        }
        return false;
    },

    _onLongPress(): void {
        var config = {tension: 40, friction: 3};
        this.state.pan.addListener((value) => {  //监听value的改变
            this.props.onMove && this.props.onMove(value);
        });
        Animated.spring(this.state.pop, {
            toValue: 1,                  // pop到这个值，即节点变大
            ...config,
        }).start();
        this.setState({panResponder: PanResponder.create({
            onPanResponderMove: Animated.event([
                null,                                         // native event - ignore
                {dx: new Animated.Value(0), dy: this.state.pan.y}, // links pan 这里设置关联的pan偏移量
            ]),
            onPanResponderRelease: (e, gestureState) => {
                LayoutAnimation.easeInEaseOut();  // animates layout update as one batch
                Animated.spring(this.state.pop, {
                    toValue: 0,                     // Pop back to 0
                    ...config,
                }).start();
                this.setState({panResponder: undefined});
                this.props.onMove && this.props.onMove({
                    x: gestureState.dx + this.props.restLayout.x,
                    y: gestureState.dy + this.props.restLayout.y,
                });
                this.props.onDeactivate();
                this.setTimeout(() => this.props.toggleScroll(true), 100);
                this.setState({shouldUpdate: false});
            },
        })}, () => {
            this.setState({shouldUpdate: true});
            this.props.onActivate();
            this.props.toggleScroll(false);
        });
    },
     _onLongPressPre: function () {
         this.props.toggleScroll(false);
     },

    render(): ReactElement {

        if (this.state.panResponder) {
            var handlers = this.state.panResponder.panHandlers;

            var tmpLayout = this.state.pan.getLayout();
            var dragStyle = {                 //  Used to position while dragging
                position: 'absolute',           //  Hoist out of layout
                left: 0,
                right: 0,
                ...tmpLayout,  //  Convenience converter
            };
        } else {
            var oriPageXY = {pageX: 0, pageY: 0};
            handlers = {
                onStartShouldSetResponder: () => !this.state.isActive,
                onResponderGrant: (evt, gestureState) => {
                    this.state.pan.setValue({x: 0, y: 0});           // reset
                    this.state.pan.setOffset(this.props.restLayout); // offset from onLayout
                    this.longTimerPre = this.setTimeout(this._onLongPressPre, 200);
                    this.longTimer = this.setTimeout(this._onLongPress, 300);
                    var evt_native = evt.nativeEvent;
                    oriPageXY = {pageX: evt_native.pageX, pageY: evt_native.pageY };
                },
                onResponderMove: (evt, gestureState) => {
                    var evt_native = evt.nativeEvent;
                    var curPageXY = {pageX: evt_native.pageX, pageY: evt_native.pageY };
                    var move_dis = Math.pow(oriPageXY.pageX -  curPageXY.pageX, 2) + Math.pow(oriPageXY.pageY -  curPageXY.pageY, 2);
                    if (move_dis > 25) {
                        this.setState({shouldUpdate: false});
                        this.clearTimeout(this.longTimer);
                        this.clearTimeout(this.longTimerPre);
                        //setTimeout(() => this.props.toggleScroll(true), 100);
                    }
                },
                onResponderRelease: () => {
                    this.setState({shouldUpdate: false});
                    if (!this.state.panResponder) {
                        this.clearTimeout(this.longTimer);
                        this.clearTimeout(this.longTimerPre);
                        this.props.toggleScroll(true);
                        this.props.onPressCell && this.props.onPressCell(this.props.rowData);
                        //this._toggleIsActive();
                        console.log('onResponderRelease _toggleIsActive');
                    }
                }
            };
        }
        var animatedStyle: Object = {
            shadowOpacity: this.state.pop,    // no need for interpolation
            transform: [
                {scale: this.state.pop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1]         // scale up from 1 to 1.3
                })},
            ],
        };
        var openVal = this.props.openVal;
        if (this.props.dummy) {
            animatedStyle.opacity = 0;
        } else if (this.state.isActive) {
            console.log('active');
        }

        var CellComponent = this.props.cellComponent;

        var props = {dragHandlers: handlers, shouldUpdate: this.state.shouldUpdate, rowData: this.props.rowData};

        var content = (<CellComponent {...this.props.cellProps} {...props}/>);


        return (
            <Animated.View
                onLayout={this.props.onLayout}
                style={[styles.dragView, dragStyle, animatedStyle, this.state.isActive ? styles.open : null]}>
                {content}
            </Animated.View>
        );
    },

    _toggleIsActive(velocity): void {
        var config = {tension: 30, friction: 7};
        if (this.state.isActive) {
            Animated.spring(this.props.openVal, {toValue: 0, ...config}).start(() => {
                this.setState({isActive: false}, this.props.onDeactivate);
            });
        } else {
            this.props.onActivate();
            this.setState({isActive: true, panResponder: undefined}, () => {
                // this.props.openVal.setValue(1);
                Animated.spring(this.props.openVal, {toValue: 1, ...config}).start();
            });
        }
    }
});

var styles = StyleSheet.create({
    dragView: {
        shadowRadius: 10,
        shadowColor: 'rgba(0,0,0,0.7)',
        shadowOffset: {height: 8},
        backgroundColor: 'transparent',
    },
    open: {
        position: 'absolute',
        left: 8,
        top: 8,
        right: 0,
        bottom: 0,
    },
    darkening: {
        backgroundColor: 'black',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
});

module.exports = AnimateCell;
