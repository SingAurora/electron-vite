import { useState } from 'react'
import './List.css'
import { areParenthesesMatching } from './fun'
import axios from 'axios'

function axiosSave(value) {
  const postData = {
    history: value
  }
  axios
    .post('https://localhost:8080', postData)
    .then((response) => {
      // 请求成功时的处理
      console.log('成功响应:', response.data)
    })
    .catch((error) => {
      // 请求失败时的处理
      console.error('错误:', error)
    })
}

function axiosGet(value) {}

const List = () => {
  const [text, setText] = useState('') // 显示的结果值, 也就是第一行输入框的值
  const [status, setStatus] = useState(0) // 判断用户是否已经进行求值  0: 是, 1: 否
  const [value, setValue] = useState('') // 计算结果值, 也就是第二行输入框的值
  const [sign, setSign] = useState('')
  const [result, setResult] = useState('')
  const [show, setShow] = useState(false)

  // 输入值
  const change = (e) => {
    if (text.length >= 11) return // 算式的长度不能超过11个字符
    if (e.target.innerHTML === '(' || e.target.innerHTML === ')') {
      setText(value + e.target.innerHTML)
    }
    if (
      e.target.innerHTML === '+' ||
      e.target.innerHTML === '-' ||
      e.target.innerHTML === '*' ||
      e.target.innerHTML === '/' ||
      e.target.innerHTML === '%' ||
      e.target.innerHTML === '^'
    ) {
      setSign(e.target.innerHTML)
    }
    // e.target.innerHTML  获取按钮的值
    let val // 定义一个变量进行更新值
    if (status === 0) {
      if (text === '0') {
        // 判断第一次是否是0
        if (
          e.target.innerHTML === '+' ||
          e.target.innerHTML === '-' ||
          e.target.innerHTML === '*' ||
          e.target.innerHTML === '/' ||
          e.target.innerHTML === '%' ||
          e.target.innerHTML === '.' ||
          e.target.innerHTML === '^'
        ) {
          val = text + e.target.innerHTML
        } else {
          val = e.target.innerHTML
        }
      } else if (text === '') {
        if (
          e.target.innerHTML === '+' ||
          e.target.innerHTML === '*' ||
          e.target.innerHTML === '/' ||
          e.target.innerHTML === '%' ||
          e.target.innerHTML === '^'
        ) {
          val = ''
        } else {
          val = e.target.innerHTML
        }
      } else {
        const arr = text.split('')
        setText('')
        if (arr.length > 0) {
          // 获取显示的值最右一位
          setText(arr[text.split('').length - 1])
        }
        if (
          text === '+' ||
          text === '-' ||
          text === '*' ||
          text === '/' ||
          text === '%' ||
          text === '.' ||
          text === '^'
        ) {
          // 判断最后一位是否是 ' + '  ' — ' ' * '  ' / '
          if (
            e.target.innerHTML !== '+' &&
            e.target.innerHTML !== '-' &&
            e.target.innerHTML !== '*' &&
            e.target.innerHTML !== '/' &&
            e.target.innerHTML !== '%' &&
            e.target.innerHTML === '^'
          ) {
            // 判断用户再次输入的是否是数字
            val = text + e.target.innerHTML
          } else {
            // 不是则删除之前的运算符
            val = text.substring(0, text.length - 1) + e.target.innerHTML
          }
        } else {
          val = text + e.target.innerHTML
        }
      }
    } else {
      if (
        e.target.innerHTML === '+' ||
        e.target.innerHTML === '-' ||
        e.target.innerHTML === '*' ||
        e.target.innerHTML === '/' ||
        e.target.innerHTML === '%' ||
        e.target.innerHTML === '^'
      ) {
        // 等于后在该值上进行运算,则不覆盖原有的值
        val = text + e.target.innerHTML
      } else {
        // 对等于后的值不进行计算,则进行覆盖
        val = e.target.innerHTML
      }
    }
    let valueText = '' // 处理实时计算的变量
    try {
      if (val !== '') {
        if (val === '.') {
          valueText = ''
        } else {
          const lastArrs = val.split('')
          let lastTexts = ''
          // 获取显示的值最右一位
          if (lastArrs.length > 0) {
            // eslint-disable-next-line no-var
            lastTexts = lastArrs[val.split('').length - 1]
          }
          if (
            lastTexts === '+' ||
            lastTexts === '-' ||
            lastTexts === '*' ||
            lastTexts === '/' ||
            lastTexts === '%' ||
            lastTexts === '^'
          ) {
            valueText = eval(val.substring(0, val.length - 1))
          } else {
            if (sign === '^') {
              valueText = eval(mathPow(val))
            } else if (val[val.length - 1] === '0') {
              valueText = 'ERR'
            } else {
              valueText = eval(val)
            }
          }
        }
      }
    } catch {
      setText(val)
      setStatus(0)
      setValue('ERR')
    }
    setText(val)
    setStatus(0)
    if (areParenthesesMatching(val) === true) {
      setValue(valueText)
    } else {
      setValue('ERR')
    }
  }
  // 求值
  const equal = () => {
    if (areParenthesesMatching(text) === false) {
      setText('ERR')
      setStatus(1)
      setValue('')
      return
    }
    try {
      if (text !== '') {
        // console.log('text', text)
        const equalArr = text.split('')
        // console.log('equalArr', equalArr)
        const equalText = equalArr[text.split('').length - 1]
        // console.log('equalText', equalText)
        if (sign === '^') {
          setSign('')
          setText(eval(mathPow(text)))
          setResult(eval(mathPow(text)))
          setStatus(1)
          setValue('')
          axiosSave(text + '=' + eval(mathPow(text)))
          return
        } else if ((sign === '/' || sign === '%') && equalArr[equalArr.length - 1] === '0') {
          setText('ERR')
          setStatus(1)
          setValue('')
          return
        }
        setText(eval(text))
        setResult(eval(text))
        setStatus(1)
        setValue('')
        axiosSave(text + '=' + eval(text))
      }
    } catch {
      setText('ERR')
      setStatus(1)
      setValue('')
    }
  }
  // 清除输入框的值
  const clear = () => {
    setText('')
    setStatus(0)
    setValue('')
  }
  // 删除最后一位
  const del = () => {
    if (text !== '') {
      if (typeof text === 'number') {
        // 计算结果后值为数字类型  强制转成字符串类型
        setText(text.toString())
      }
      setText(text.substring(0, text.length - 1))
      setStatus(0)
    }
  }

  // 幂运算
  const mathPow = (inputString) => {
    let parts = inputString.split('^')

    if (parts.length === 2) {
      let x = parts[0]
      let y = parts[1]
      let resultString = `Math.pow(${x},${y})`
      return resultString
    } else {
      console.log('输入字符串格式不正确')
      return ''
    }
  }

  return (
    <div>
      <div className="content rounded-lg p-6 pb-3 w-96 bg-[#c7eeff] fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
        {/* 显示区域 */}
        <div className="display mb-4 border border-gray-200 border-solid rounded-lg bg-slate-100">
          <div className="h-16 w-66 text-right leading-normal rounded-t-lg text-5xl mr-1 text-slate-500">
            {text}
          </div>
          <div className="h-10 w-66 text-right leading-normal rounded-b-lg text-2xl mr-2 text-slate-500">
            {value}
          </div>
        </div>
        {/* 键盘区 */}
        <div className="btn-cont pt-4">
          <div className="grid gap-x-3 grid-cols-4 mb-5">
            <button className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-red-400" onClick={del}>
              Del
            </button>
            <button
              className="text-2xl  m-2 w-14 h-14 rounded-3xl hover:text-red-400"
              onClick={clear}
            >
              C
            </button>
            <button
              className="text-2xl  m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              ^
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              +
            </button>
          </div>
          <div className="grid gap-x-3 grid-cols-4 mb-3">
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              7
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              8
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              9
            </button>

            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              -
            </button>
          </div>
          <div className="grid gap-x-3 grid-cols-4  mb-3">
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              4
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              5
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              6
            </button>
            <button
              className="text-2xl  m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              *
            </button>
          </div>
          <div className="grid gap-x-3 grid-cols-4  mb-3">
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              1
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              2
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              3
            </button>
            <button
              className="text-2xl  m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              /
            </button>
          </div>
          <div className="grid gap-x-3 grid-cols-4 mb-3">
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              0
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              .
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:fill-sky-400 fill-slate-400 flex items-center justify-center"
              onClick={() => {
                setShow(!show)
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M511.998 64C264.574 64 64 264.574 64 511.998S264.574 960 511.998 960 960 759.422 960 511.998 759.422 64 511.998 64z m353.851 597.438c-82.215 194.648-306.657 285.794-501.306 203.579S78.749 558.36 160.964 363.711 467.621 77.917 662.27 160.132c168.009 70.963 262.57 250.652 225.926 429.313a383.995 383.995 0 0 1-22.347 71.993z"
                  className="fill-inherit"
                ></path>
                <path
                  d="M543.311 498.639V256.121c0-17.657-14.314-31.97-31.97-31.97s-31.97 14.314-31.97 31.97v269.005l201.481 201.481c12.485 12.485 32.728 12.485 45.213 0s12.485-32.728 0-45.213L543.311 498.639z"
                  className="fill-inherit"
                ></path>
              </svg>
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={equal}
            >
              =
            </button>
          </div>
          <div className="grid gap-x-3 grid-cols-4  mb-3">
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              %
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              &#40;
            </button>
            <button
              className="text-2xl m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={change}
            >
              &#41;
            </button>
            <button
              className="text-2xl  m-2 w-14 h-14 rounded-3xl hover:text-sky-400"
              onClick={() => {
                setText(text + result.toString())
              }}
            >
              Ans
            </button>
          </div>
        </div>
      </div>
      {show && <div className="fixed">hello</div>}
    </div>
  )
}

export default List
