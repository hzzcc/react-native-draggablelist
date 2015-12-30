## react native dragableList

###How do I use it?
    
####Installation
    npm install react-native-dragablelist
   
####Use in your code

    var DragableList = require('react-native-dragablelist');

    <DragableList
            dataSource={this.state.dataSource}
            component={Cell}
            cellProps={/*your cell props*/}
            onMove={this._onMove}
            keys={this.state.keys}
            shouldUpdateId={'2'}
            onPressCell={this.onPressCell}
            scrollStyle: {/*styles*/}, //scroll view style
            contentInset: {}, //scroll view contentInset
            
            isScrollView: PropTypes.bool, //default true, 
            toggleScroll: PropTypes.func,
            shouldUpdate: PropTypes.bool, //update all cell
            />
            
    dataSource:     isRequired, array of your data include id, like [{id: '1', name: ''}, {id: '2', name: ''}]
    component:      isRequired, your cell component
    onMove:             callback function, return the orders of cell by id
    keys:               you can also pass data orders, like ['2','1'], but it should be same with your data ids
    shouldUpdateId:     the cell should be update
    onPressCell:        when cell pressed 
    isScrollView:       is scrollView or view, 
    toggleScroll:       if isScrollView is false, and outside component is a scrollView, should set the callback for scrollEnabled state
    shouldUpdate:       update all cell
    
####Attention 
    
    In your cell component, you should add below to your view 
     
     <View>
        {/* other views*/}
        <View {...this.props.dragHandlers} >
            {/* this is the rect you can drag*/}
        </View>
        {/* other views*/}
     </View>
            

