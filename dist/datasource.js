define(['angular', 'lodash', 'moment'], function(angular, _, moment) {
  'use strict'

  /** @ngInject */
  function CalcQueriesDatasource($q, datasourceSrv, templateSrv) {
    this.datasourceSrv = datasourceSrv
    this.$q = $q
    this.templateSrv = templateSrv
    this.testDatasource = function() {
      return new Promise(function(resolve, reject) {
        resolve({
          status: 'success',
          message: 'Compare Query Source is working correctly',
          title: 'Success'
        })
      })
    }

    // Called once per panel (graph)
    this.query = function(options) {
      var _this = this
      var sets = _.groupBy(options.targets, 'datasource')
      var querys = _.groupBy(options.targets, 'refId')
      var promises = []
      //console.log("querys",querys)
      _.forEach(sets, function(targets, dsName) {
        var opt = angular.copy(options)

        var promise = _this.datasourceSrv.get(dsName).then(function(ds) {
          if (ds.meta.id === _this.meta.id) {
            return _this._calcQuery(options, targets, querys, _this)
          } else {
            opt.targets = targets
            return ds.query(opt)
          }
        })
        promises.push(promise)
      })
      let result = this.$q.all(promises).then(function(results) {
        return {
          data: _.flatten(
            _.filter(
              _.map(results, function(result) {
                var data = result.data
                if (data) {
                  data = _.filter(result.data, function(datum) {
                    return datum.hide !== true
                  })
                }
                return data
              }),
              function(result) {
                return result !== undefined && result !== null
              }
            )
          )
        }
      })
      //console.log("tt1",result)
      return result
    }

    this._calcQuery = async function(options, targets, querys, _this) {
      var calcPromises = []
      //console.log('_calcQuery targets', targets)
      for(var target of targets){
        //console.log('_calcQuery target', target)
        if (target.query == null || target.query == '') {
          return
        }
        var formula = target.query.trim()
        var varDataDic = {}
        for (const varCh of formula.replace(/[^a-zA-Z]/ig,"")) {
          //console.log(varCh);
          varDataDic[varCh] = await getQueryData(varCh,options,querys,_this)
          varDataDic[varCh] = varDataDic[varCh] //[{target: "ray-B", datapoints: [Array(1441)]}]
        }
        //console.log("varDataDic ",varDataDic)
        var formulaRet = exp_result(formula,varDataDic) //[{datapoints: [Array(1441)]}]
        var ret = []
        for (let index = 0; index < formulaRet.length; index++) {
          var element = formulaRet[index];
          element['target']= target.query+"_"+index
          ret.push(element)
        }

        if (ret) {
          //console.log("all-final",ret)
        }

        let rr = Promise.resolve({data: ret})
        //console.log("calcPromises1.len",calcPromises.push(rr))
        continue
      }
      //console.log("calcPromises2.len",calcPromises.length)
      Promise.all(calcPromises).then(function(values) {
        //console.log("Promise.all",values);
      });
      //console.log("calcPromises",calcPromises)
      let rret = this.$q.all(calcPromises).then(function(results) {
      // let rret = Promise.all(calcPromises).then(function(results) {
        //console.log("results",results)
          return {
            data: _.flatten(
              _.filter(
                _.map(results, function(result) {
                  var data = result.data
                  if (data) {
                    data = _.filter(result.data, function(datum) {
                      return datum.hide !== true
                    })
                  }
                  return data
                }),
                function(result) {
                  return result !== undefined && result !== null
                }
              )
            )
          }
        })
      //console.log("rret",rret)
      return rret
    }
    async function getQueryData(querySymbol,options,querys,_this){
      var isletter = /^[a-zA-Z]+$/.test(querySymbol)
      if (!isletter) {
        return querySymbol
      }
      querySymbol =querySymbol.toUpperCase()
      var queryObj = angular.copy(querys[querySymbol][0])
      queryObj.hide = false
      if (queryObj) {
        var comapreDsName = queryObj.datasource

        let tarData = await _this.datasourceSrv.get(comapreDsName)
        let calcOptions = angular.copy(options)
        calcOptions.targets = [queryObj]
        tarData = await tarData.query(calcOptions)
        tarData.target="ray-"+querySymbol
        tarData.data[0].target="ray-"+querySymbol
        //console.log("tarData",tarData)
        return tarData.data
      }
      return []
    }
  
    const array1=new Array('+','-','*','/','(',')','@')
    const array20=new Array('>','>','<','<','<','>', '>')
    const array21=new Array( '>','>','<','<','<','>','>')
    const array22=new Array( '>','>','>','>','<','>','>')
    const array23=new Array('>','>','>','>','<','>','>')
    const array24=new Array('<','<','<','<','<','=',' ')
    const array25=new Array('>','>','>','>',' ','>','>')
    const array26=new Array( '<','<','<','<','<',' ','=')
    const array2=new Array(array20,array21,array22,array23,array24,array25,array26)
    function compare(ch1, ch2)         //比较运算符ch1和ch2优先级
    {
      for(var i=0;ch1!=array1[i];i++);
      for(var j=0;ch2!=array1[j];j++);
      return array2[i][j]
    }

    function operate(a,preop,b,varDataDic)  //计算a？b的值
    {
      var num1=parseFloat(a)
      var num2=parseFloat(b)
      var stat = 0
      if (isNaN(num1)) {
        stat = 1
        if (typeof(a)=='string') {
          a = a.toUpperCase()
          num1 = varDataDic[a]
        }else{
          num1 = a
        }
      }
      if (isNaN(num2)) {
        stat = stat==0?2:3
        if (typeof(b)=='string') {
          b = b.toUpperCase()
          num2 = varDataDic[b]
        }else{
          num2 = b
        }
      }
      
      switch(stat)
      {
        case 0:return calucuIt2Float(num1,num2,preop);break;
        case 1:return calucuItListFloat(num1,num2,preop);break;
        case 2:return calucuItFloatList(num1,num2,preop);break;
        case 3:return calucuIt2List(num1,num2,preop);break;
      }
    }
    
    function calucuIt2Float(num1,num2,operator){
      switch(operator)
      {
        case '+':return(num1+num2);break;
        case '-':return(num1-num2);break;
        case '*':return(num1*num2);break;
        case '/':return(num1/num2);break;
      }
    }

    function calucuIt2List(num1,num2,operator){
      var rret = []
      //console.log(calucuIt2List)
      for (let index = 0; index < num1.length; index++) {
        var Adata = num1[index]
        var Bdata = num2[index]
        var ret = {datapoints:[]}
        for (let index2 = 0; index2 < Adata.datapoints.length; index2++) {
          var Adatapoint = Adata.datapoints[index2]
          var Bdatapoint = Bdata.datapoints[index2]
          if(Adatapoint[0]==null||Bdatapoint[0]==null||isNaN(Adatapoint[0])||isNaN(Bdatapoint[0])){
            continue
          }
          switch (operator) {
            case '+':
              ret.datapoints.push([Adatapoint[0]+Bdatapoint[0],Adatapoint[1]])
              break;
            case '-':
              ret.datapoints.push([Adatapoint[0]-Bdatapoint[0],Adatapoint[1]])
              break;
            case '*':
              ret.datapoints.push([Adatapoint[0]*Bdatapoint[0],Adatapoint[1]])
              break;
            case '/':
              ret.datapoints.push([Adatapoint[0]/Bdatapoint[0],Adatapoint[1]])
              break;
            default:
              break;
          }
        }
        rret.push(ret)
      }
      
      //console.log("calucuIt2List final",rret)
      return rret
    }

    function calucuItFloatList(num1,num2,operator){
      var rret = []
      for (let index = 0; index < num2.length; index++) {
        var ret = {datapoints:[]}
        var Adatapoint = num1
        var Bdata = num2[index]
        for (let index2 = 0; index2 < Bdata.datapoints.length; index2++) {
          var Bdatapoint = Bdata.datapoints[index2]
          if(Adatapoint==null||Bdatapoint[0]==null||isNaN(Adatapoint)||isNaN(Bdatapoint[0])){
            continue
          }
          switch (operator) {
            case '+':
              ret.datapoints.push([Adatapoint+Bdatapoint[0],Bdatapoint[1]])
              break;
            case '-':
              ret.datapoints.push([Adatapoint-Bdatapoint[0],Bdatapoint[1]])
              break;
            case '*':
              ret.datapoints.push([Adatapoint*Bdatapoint[0],Bdatapoint[1]])
              break;
            case '/':
              ret.datapoints.push([Adatapoint/Bdatapoint[0],Bdatapoint[1]])
              break;
            default:
              break;
          }
        }
        rret.push(ret)
      }
      
      //console.log("calucuItFloatList final",rret)
      return rret
    }

    function calucuItListFloat(num1,num2,operator){
      var rret = []
      for (let index = 0; index < num1.length; index++) {
        var Adata = num1[index]
        var Bdatapoint = num2
        var ret = {datapoints:[]}
        for (let index2 = 0; index2 < Adata.datapoints.length; index2++) {
          var Adatapoint = Adata.datapoints[index2];
          if(Adatapoint[0]==null||Bdatapoint==null||isNaN(Adatapoint[0])||isNaN(Bdatapoint)){
            continue
          }
          switch (operator) {
            case '+':
              ret.datapoints.push([Adatapoint[0]+Bdatapoint,Adatapoint[1]])
              break;
            case '-':
              ret.datapoints.push([Adatapoint[0]-Bdatapoint,Adatapoint[1]])
              break;
            case '*':
              ret.datapoints.push([Adatapoint[0]*Bdatapoint,Adatapoint[1]])
              break;
            case '/':
              ret.datapoints.push([Adatapoint[0]/Bdatapoint,Adatapoint[1]])
              break;
            default:
              break;
          }
        }
        rret.push(ret)
      }
      //console.log("calucuItFloatList final",rret)
      return rret
    }

    function isNum( ch)                //判断读取ch是否为操作数
    {
      if(ch=='+'||ch=='-'||ch=='*'||ch=='/'||ch=='('||ch==')'||ch=='@')
        return 0
      else
        return 1
    }

    function extend(str)    //将开始一定情况下‘-'转换为'（0-1）*'，从而支持负数
    {
      var str1=new Array()
      if(str.charAt(0)=='-')
      {
        str1+="(0-1)*"
      }
      else
      {
        str1+=str.charAt(0)
      }
      for(var i=1;i<str.length;i++)
      {
        if(str.charAt(i)=='-'&&str.charAt(i-1)=='(')
        {
          str1+="(0-1)*"
        }
        else
        str1+=str.charAt(i)
      }
      return str1;
    }

    function divided(str)  //分离表达式中操作数与操作符存放到返回值中
    {
      var str2=extend(str)
      // alert(str2);
      var str_temp=new Array()
      var j=0
      var expTemp
      var expPre
      for(var i=0;i<str2.length;i++)
      {
        // alert(str2.charAt(i));
        expTemp=""
        expTemp=str2.charAt(i)
        if(i==0)
        str_temp[0]=expTemp
        if(i>0)
        {
        expPre=str2.charAt(i-1) ///////////////////////!!
        if(isNum(expTemp)&&isNum(expPre))  //判断前后连续取到的是否都是数字字符，是则拼接
        {
          str_temp[j-1]+=expTemp
          j--
        }
          else
          {
          str_temp[j]=expTemp
          }
        }
        j++
      }
      return str_temp
    }

    function exp_result(str_exp,varDataDic)
    {
      str_exp=str_exp+'@'
      var str=divided(str_exp)
      var numArray=new Array()  //存放操作数
      var symbolArray =new Array()//存放操作符
      symbolArray.push('@')
    
      for(var i=0;str[i]!='@'||symbolArray[symbolArray.length-1]!='@';i++)
      {
        if(isNum(str[i]))
        {
          numArray.push(str[i])
        }
        else
        {
          var preop=symbolArray[symbolArray.length-1]  //取栈顶元素
          switch(compare(preop,str[i]))
          {
            case'<':symbolArray.push(str[i]);break;
            case'=':symbolArray.pop();break;
            case'>':
              var b=numArray.pop()
              var a=numArray.pop();
              preop=symbolArray.pop() //取两操作数与之前操作符运算
              numArray.push(operate(a,preop,b,varDataDic)) //计算结果入栈
              i--;   //继续与之前的操作符比较
              break;
          }
        }
      }
      return numArray[0];
    }


  }
  return {
    CalcQueriesDatasource: CalcQueriesDatasource
  }
})
