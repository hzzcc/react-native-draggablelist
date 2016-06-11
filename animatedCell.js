'use strict';

import React , {Component, PropTypes} from 'react'
import {
    Animated,
    LayoutAnimation,
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';

var TimerMixin = require('react-timer-mixin');

var AnimateCell = React.createClass({

    mixins: [TimerMixin],

    getInitialState: function () {
        return {
            pan: new Animated.ValueXY(), // 减少样本矢量.
            pop: new Animated.Value(0),  // 初值.
            shouldUpdate: false,
        };
    },

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.shouldUpdate || (nextState.shouldUpdate !== this.state.shouldUpdate)) {
            return true;
        }
        return false;
    },

    _onLongPress(): void {

        this.props.toggleScroll(false, this.toSetPanResponder);
    },

    toSetPanResponder() {
        var config = {tension: 40, friction: 3};
        this.state.pan.addListener((value) => {  //监听value的改变
            this.props.onMove && this.props.onMove(value);
        });
        Animated.spring(this.state.pop, {
            toValue: 1,                  // pop到这个值，即节点变大
            ...config,
        }).start();
        this.setState({panResponder: PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([
                null,                                         // native event - ignore
                {dx: new Animated.Value(0), dy: this.state.pan.y}, // links pan 这里设置关联的pan偏移量
            ]),
            onPanResponderTerminate: (evt, gestureState) => {
                console.log('onPanResponderTerminate');

                this.props.toggleScroll(true);

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
                this.props.onActivate && this.props.onActivate();
                this.props.onDeactivate && this.props.onDeactivate();

                this.setState({shouldUpdate: false});
            },
            onPanResponderRelease: (e, gestureState) => {
                console.log('onPanResponderRelease');
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
                this.setState({shouldUpdate: false});
                this.props.toggleScroll(true);
            },
        })}, () => {
            this.setState({shouldUpdate: true});
            console.log('onActivate');
            this.props.onActivate();
        });
    },

    render(): ReactElement {

        if (this.state.panResponder) {
            var handlers = this.state.panResponder.panHandlers;

            var tmpLayout = this.state.pan.getLayout();
            var dragStyle = {                 //  Used to position while dragging
                position: 'absolute',           //  Hoist out of layout
                left: 0,
                right: 0,
                transform: [{'translate':[0,0,1]}],
                ...tmpLayout,  //  Convenience converter
            };
        } else {
            var oriPageXY = {pageX: 0, pageY: 0};
            handlers = {
                onStartShouldSetResponder: () => true,
                onResponderGrant: (evt, gestureState) => {
                    this.state.pan.setValue({x: 0, y: 0});           // reset
                    this.state.pan.setOffset(this.props.restLayout); // offset from onLayout
                    this.longTimer = this.setTimeout(this._onLongPress, 300);
                    var evt_native = evt.nativeEvent;
                    oriPageXY = {pageX: evt_native.pageX, pageY: evt_native.pageY };
                },
                onResponderMove: (evt, gestureState) => {
                    console.log('onResponderMove');
                    var evt_native = evt.nativeEvent;
                    this.setState({shouldUpdate: false});
                    this.clearTimeout(this.longTimer);
                },
                onResponderRelease: () => {
                    console.log('onResponderRelease');

                    if (!this.state.panResponder) {
                        this.setState({shouldUpdate: false, panResponder: undefined});
                        this.clearTimeout(this.longTimer);
                        //this.props.onDeactivate && this.props.onDeactivate();
                        this.props.toggleScroll(true);
                        this.props.onPressCell && this.props.onPressCell(this.props.rowData);
                        console.log('onResponderRelease _toggleIsActive');
                    }else{
                        this.setState({shouldUpdate: false});
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
        }

        var CellComponent = this.props.cellComponent;

        var shouldUpdate = this.state.shouldUpdate || (this.props.shouldUpdateId == this.props.rowData.id);
        var props = {dragHandlers: handlers, shouldUpdate: shouldUpdate, rowData: this.props.rowData};

        var content = (<CellComponent {...this.props.cellProps} {...props}/>);

        return (
            <Animated.View
                ref='CellView'
                onLayout={this.props.onLayout}
                style={[styles.dragView, dragStyle, animatedStyle]}>
                {content}
            </Animated.View>
        );
    },

});

var styles = StyleSheet.create({
    dragView: {
        shadowRadius: 10,
        shadowColor: 'rgba(0,0,0,0.7)',
        shadowOffset: {height: 8},
        backgroundColor: 'transparent',
    },
});

module.exports = AnimateCell;
