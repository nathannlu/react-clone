/** @jsxRuntime classic  */
import React from 'react';
import ReactDOM from 'react-dom'

// React Functions
const createElement = (type, props, ...children) => {
	let adoptedChildren = []
	children.forEach(child => {
		if (typeof child == 'object') {
			adoptedChildren.push(child)
		} else {
			let newChild = {
				type: 'TEXT_ELEMENT',
				props: {
					nodeValue: child
				}
			}
			adoptedChildren.push(newChild)
		}
	})

	return {
		type: type,
		props: {
			...props,
			children: adoptedChildren 
		}
	}
};

const createDom = (fiber) => {
	// Create document node
	const dom =
		fiber.type == 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(fiber.type)

	// Assign prop values from fiber object to dom node
	const isProperty = key => key !== 'children'
	Object.keys(fiber.props)
		.filter(isProperty)
		.forEach(name => {
			dom[name] = fiber.props[name] 
		})

	return dom;
};

const render = (element, container) => {
	// TODO set next unit of work
	wipRoot = {
		dom: container,
		props: {
			children: [element]
		},
		alternate: currentRoot,
	}
	deletions = []
	nextUnitOfWork = wipRoot
};

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletions = null

const updateDom = (dom, prevProps, nextProps) => {
	const isEvent = key => key.startsWith("on")
	const isProperty = key => key !== 'children' && !isEvent(key)
	const isNew = (prev, next) => key => prev[key] !== next[key]
	const isGone = (prev, next) => key =>	!(key in next)

	// Remove old event listeners
	Object.keys(prevProps)
		.filter(isEvent)
		.filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach(name => {
			const eventType	= name
				.toLowerCase()
				.substring(2)

			dom.removeEventListener(
				eventType,
				prevProps[name]
			)
		})

	// Remove old properties
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(prevProps, nextProps))
		.forEach(name => {
			dom[name] = ""
		})

	// Add event listeners
	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps,nextProps))
		.forEach(name => {
			const eventType = name
				.toLowerCase()
				.substring(2)

			dom.addEventListener(
				eventType,
				nextProps[name]
			)
		})

	// Set new or changed properties
	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			dom[name] = nextProps[name]
		})
};

const commitRoot = () => {
	deletions.forEach(commitWork)
	commitWork(wipRoot.child)	
	currentRoot = wipRoot
	wipRoot = null
};

const commitWork = fiber => {
	if(!fiber) {
		return
	}
	const domParent = fiber.parent.dom
	domParent.appendChild(fiber.dom)
	if (
		fiber.effectTag === 'PLACEMENT' &&
		fiber.dom != null 
	) {
		domParent.appendChild(fiber.dom)
	} else if (
		fiber.effectTag === 'UPDATE' &&
		fiber.dom != null
	) {
		updateDom(
			fiber.dom,
			fiber.alternate.props,
			fiber.props
		);
	} else if (fiber.effectTag === 'DELETION') {
		domParent.removeChild(fiber.dom) 
	}

	commitWork(fiber.child)
	commitWork(fiber.sibling)
};
	

const workLoop = deadline => {
	let shouldYield = false

	while(nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

		shouldYield = deadline.timeRemaining() < 1
		console.log("Time remaining:", deadline.timeRemaining())
	}

	if(!nextUnitOfWork && wipRoot) {
		commitRoot()
	}

	requestIdleCallback(workLoop)
};

requestIdleCallback(workLoop)

const performUnitOfWork = fiber => {
	if(!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	const elements = fiber.props.children
	reconcileChildren(fiber, elements)

	if(fiber.child) {
		return fiber.child
	}
	
	let nextFiber = fiber
	while(nextFiber) {
		if(nextFiber.sibling) {
			return nextFiber.sibling
		}

		nextFiber = nextFiber.parent
	}

}

const reconcileChildren = (wipFiber, elements) => {
	let index = 0
	let oldFiber = 
		wipFiber.alternative && wipFiber.alternative.child
	let prevSibling = null

	// Loop through children of fiber
	while (
		index < elements.length ||
		oldFiber != null	
	) {
		const element = elements[index]
		let newFiber = null

		const sameType = 
			oldFiber && 
			element &&
			element.type == oldFiber.type

		if(sameType) {
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: 'UPDATE',
			};
		}

		if(element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null, 
				effectTag: 'PLACEMENT',
			};
		}

		if(oldFiber && !sameType) {
			oldFiber.effectTag = 'DELETION'
			deletions.push(oldFiber)
		}
	}


};

const ReactClone = {
	createElement,
	render
};


/** @jsx ReactClone.createElement */
const container = document.getElementById("root")

const updateValue = e => {
  rerender(e.target.value)
}

const rerender = value => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  )
  ReactClone.render(element, container)
}

rerender("World");
