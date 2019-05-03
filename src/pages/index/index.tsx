import Taro, { Component, Config } from '@tarojs/taro'
import { View, MovableArea, MovableView, ScrollView } from '@tarojs/components'
import './index.less'

export default class Index extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页'
  }
  state = {
    lists: [{
      key: "1",
      x: 0,
      startX: 0,
      slideOut: false
    },
    {
      key: "2",
      x: 0,
      startX: 0,
      slideOut: false
    },{
      key: "3",
      x: 0,
      startX: 0,
      slideOut: false
    },{
      key: "4",
      x: 0,
      startX: 0,
      slideOut: false
    }],
    moveAction: false
  }
  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  onTouchStartHandler(event){
    const {item} = event.currentTarget.dataset;
    const {pageX} = event.changedTouches[0];
    let _lists = this.state.lists;
    _lists.map((_item) => {
        if (_item.key != item.key) {
          _item.x = 0;
        } else {
          _item.startX = pageX;
        }
    })
    this.setState({
      lists: _lists
    })
  }

  onHandleSlideOut(event){
    const {moveAction} = this.state;
    if (!moveAction) {
        return;
    }
    const {pageX} = event.changedTouches[0];
    const {item} = event.currentTarget.dataset;
    const distance = pageX - item.startX;
    if (distance >= 0) {
      item.x = 0;
      item.slideOut = false
    }  else {
      item.x = -distance > 60 ? -180 : -distance;
      item.slideOut = -distance > 60;
    }
    let _lists = this.state.lists;
    _lists.map((_item) => {
      if (_item.key == item.key) {
          _item.x = item.x;
          _item.slideOut = item.slideOut;
          _item.startX = 0;
      }
    })
    this.setState({
      lists: _lists,
      moveAction: false
    })
  }

  onResetItemsSlideStatus(_event){
    let _lists = this.state.lists;
    _lists.map((_item) => {
      _item.x = 0;
      _item.slideOut = false;
      _item.startX = 0;
    })
    this.setState({
      lists: _lists
    })
  }

  onHTouchMoveHandler(_event){
    const {moveAction} = this.state;
    if (!moveAction) {
      this.setState({
          moveAction: true
      })
    }
  }

  onDeleteItem(event){
    event.stopPropagation();
    const {item} = event.currentTarget.dataset;
    Taro.showModal({
      title:'提示',
      content: `确定要删除第${item.key}项吗？`,
      success: (res) => {
        let _lists = this.state.lists; 
        if (res.confirm) {
          _lists.map((_item,index,_lists) => {
            if (_item.key == item.key){
              _lists.splice(index,1);
            }
         })
          this.setState({
              lists: _lists
          },()=>{
             Taro.showToast({
               title: "删除成功",
               icon: 'success'
             })
          })
        } else if (res.cancel) {
           _lists.map((_item) => {
              if (_item.key == item.key){
                _item.slideOut = false;
                _item.startX = 0;
                _item.x = 0;
              }
           })
           this.setState({
            lists: _lists
          })
        }
      }
    })
  }

  navigateToNextPage(event) {
    event.stopPropagation();
    const {item} = event.currentTarget.dataset;
    const _lists = this.state.lists;
    let hasSlideOut = false;
    _lists.map((_item) => {
      if (_item.slideOut) {
        hasSlideOut = true;
      }
      _item.x = 0;
      _item.slideOut = false;
      _item.startX = 0;
    })
    if (!hasSlideOut) {
        console.log(`跳转nextPage key ${item.key}`)
    } else {
       this.setState({
         lists: _lists
       })
    }
  }
  render() {
    const { lists } = this.state;
    return (
      <View className='container' onClick={this.onResetItemsSlideStatus.bind(this)}>
      <ScrollView>
        {
          lists.map((item) => {
            return <MovableArea className='movablearea' key={item.key}>
                      <MovableView className='movableview' damping={50} friction={20} onHTouchMove={this.onHTouchMoveHandler.bind(this)} direction='horizontal' inertia={true} x={item.x} 
                      >
                        <View className='content' data-item={item} onTouchStart={this.onTouchStartHandler.bind(this)} onTouchEnd={this.onHandleSlideOut.bind(this)} onClick={this.navigateToNextPage.bind(this)}>
                            我是列表第{item.key}项
                        </View>
                        <View className='del' data-item={item} onClick={this.onDeleteItem.bind(this)}>删除</View>
                      </MovableView>
                   </MovableArea>
          })
        }
      </ScrollView>
      </View>
    )
  }
}
