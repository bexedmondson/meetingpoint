
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/svelte-multiselect/dist/CircleSpinner.svelte generated by Svelte v3.59.2 */

    const file$7 = "node_modules/svelte-multiselect/dist/CircleSpinner.svelte";

    function create_fragment$8(ctx) {
    	let div;

    	let style_border_color = `${/*color*/ ctx[0]} transparent ${/*color*/ ctx[0]}
  ${/*color*/ ctx[0]}`;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "--duration", /*duration*/ ctx[1]);
    			attr_dev(div, "class", "svelte-66wdl1");
    			set_style(div, "border-color", style_border_color);
    			set_style(div, "width", /*size*/ ctx[2]);
    			set_style(div, "height", /*size*/ ctx[2]);
    			add_location(div, file$7, 5, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*duration*/ 2) {
    				set_style(div, "--duration", /*duration*/ ctx[1]);
    			}

    			const style_changed = dirty & /*duration*/ 2;

    			if (style_changed || dirty & /*color, duration*/ 3 && style_border_color !== (style_border_color = `${/*color*/ ctx[0]} transparent ${/*color*/ ctx[0]}
  ${/*color*/ ctx[0]}`)) {
    				set_style(div, "border-color", style_border_color);
    			}

    			if (style_changed || dirty & /*size, duration*/ 6) {
    				set_style(div, "width", /*size*/ ctx[2]);
    			}

    			if (style_changed || dirty & /*size, duration*/ 6) {
    				set_style(div, "height", /*size*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CircleSpinner', slots, []);
    	let { color = `cornflowerblue` } = $$props;
    	let { duration = `1.5s` } = $$props;
    	let { size = `1em` } = $$props;
    	const writable_props = ['color', 'duration', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CircleSpinner> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('duration' in $$props) $$invalidate(1, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ color, duration, size });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('duration' in $$props) $$invalidate(1, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, duration, size];
    }

    class CircleSpinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { color: 0, duration: 1, size: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CircleSpinner",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get color() {
    		throw new Error("<CircleSpinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<CircleSpinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<CircleSpinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<CircleSpinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<CircleSpinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<CircleSpinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    /* node_modules/svelte-multiselect/dist/Wiggle.svelte generated by Svelte v3.59.2 */
    const file$6 = "node_modules/svelte-multiselect/dist/Wiggle.svelte";

    function create_fragment$7(ctx) {
    	let span;

    	let style_transform = `rotate(${/*$store*/ ctx[0].angle}deg) scale(${/*$store*/ ctx[0].scale}) translate(${/*$store*/ ctx[0].dx}px,
  ${/*$store*/ ctx[0].dy}px)`;

    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_style(span, "transform", style_transform);
    			add_location(span, file$6, 18, 0, 678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*$store*/ 1 && style_transform !== (style_transform = `rotate(${/*$store*/ ctx[0].angle}deg) scale(${/*$store*/ ctx[0].scale}) translate(${/*$store*/ ctx[0].dx}px,
  ${/*$store*/ ctx[0].dy}px)`)) {
    				set_style(span, "transform", style_transform);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $store;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wiggle', slots, ['default']);
    	let { wiggle = false } = $$props;
    	let { angle = 0 } = $$props;
    	let { scale = 1 } = $$props;
    	let { dx = 0 } = $$props;
    	let { dy = 0 } = $$props;
    	let { duration = 200 } = $$props;
    	let { stiffness = 0.05 } = $$props;
    	let { damping = 0.1 } = $$props;
    	let rest_state = { angle: 0, scale: 1, dx: 0, dy: 0 };
    	let store = spring(rest_state, { stiffness, damping });
    	validate_store(store, 'store');
    	component_subscribe($$self, store, value => $$invalidate(0, $store = value));
    	const writable_props = ['wiggle', 'angle', 'scale', 'dx', 'dy', 'duration', 'stiffness', 'damping'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wiggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('wiggle' in $$props) $$invalidate(2, wiggle = $$props.wiggle);
    		if ('angle' in $$props) $$invalidate(3, angle = $$props.angle);
    		if ('scale' in $$props) $$invalidate(4, scale = $$props.scale);
    		if ('dx' in $$props) $$invalidate(5, dx = $$props.dx);
    		if ('dy' in $$props) $$invalidate(6, dy = $$props.dy);
    		if ('duration' in $$props) $$invalidate(7, duration = $$props.duration);
    		if ('stiffness' in $$props) $$invalidate(8, stiffness = $$props.stiffness);
    		if ('damping' in $$props) $$invalidate(9, damping = $$props.damping);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		spring,
    		wiggle,
    		angle,
    		scale,
    		dx,
    		dy,
    		duration,
    		stiffness,
    		damping,
    		rest_state,
    		store,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ('wiggle' in $$props) $$invalidate(2, wiggle = $$props.wiggle);
    		if ('angle' in $$props) $$invalidate(3, angle = $$props.angle);
    		if ('scale' in $$props) $$invalidate(4, scale = $$props.scale);
    		if ('dx' in $$props) $$invalidate(5, dx = $$props.dx);
    		if ('dy' in $$props) $$invalidate(6, dy = $$props.dy);
    		if ('duration' in $$props) $$invalidate(7, duration = $$props.duration);
    		if ('stiffness' in $$props) $$invalidate(8, stiffness = $$props.stiffness);
    		if ('damping' in $$props) $$invalidate(9, damping = $$props.damping);
    		if ('rest_state' in $$props) $$invalidate(12, rest_state = $$props.rest_state);
    		if ('store' in $$props) $$invalidate(1, store = $$props.store);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wiggle, duration*/ 132) {
    			if (wiggle) setTimeout(() => $$invalidate(2, wiggle = false), duration);
    		}

    		if ($$self.$$.dirty & /*wiggle, scale, angle, dx, dy*/ 124) {
    			store.set(wiggle ? { scale, angle, dx, dy } : rest_state);
    		}
    	};

    	return [
    		$store,
    		store,
    		wiggle,
    		angle,
    		scale,
    		dx,
    		dy,
    		duration,
    		stiffness,
    		damping,
    		$$scope,
    		slots
    	];
    }

    class Wiggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			wiggle: 2,
    			angle: 3,
    			scale: 4,
    			dx: 5,
    			dy: 6,
    			duration: 7,
    			stiffness: 8,
    			damping: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wiggle",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get wiggle() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wiggle(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get angle() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set angle(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dx() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dx(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dy() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dy(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stiffness() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stiffness(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get damping() {
    		throw new Error("<Wiggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set damping(value) {
    		throw new Error("<Wiggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-multiselect/dist/icons/ChevronExpand.svelte generated by Svelte v3.59.2 */

    const file$5 = "node_modules/svelte-multiselect/dist/icons/ChevronExpand.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let path;
    	let svg_levels = [/*$$props*/ ctx[0], { fill: "currentColor" }, { viewBox: "0 0 16 16" }];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z");
    			add_location(path, file$5, 1, 2, 61);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0],
    				{ fill: "currentColor" },
    				{ viewBox: "0 0 16 16" }
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChevronExpand', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class ChevronExpand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronExpand",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/svelte-multiselect/dist/icons/Cross.svelte generated by Svelte v3.59.2 */

    const file$4 = "node_modules/svelte-multiselect/dist/icons/Cross.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;
    	let svg_levels = [/*$$props*/ ctx[0], { viewBox: "0 0 24 24" }, { fill: "currentColor" }];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z");
    			add_location(path, file$4, 1, 2, 61);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0],
    				{ viewBox: "0 0 24 24" },
    				{ fill: "currentColor" }
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cross', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Cross extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cross",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules/svelte-multiselect/dist/icons/Disabled.svelte generated by Svelte v3.59.2 */

    const file$3 = "node_modules/svelte-multiselect/dist/icons/Disabled.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path;
    	let svg_levels = [/*$$props*/ ctx[0], { viewBox: "0 0 24 24" }, { fill: "currentColor" }];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Zm-4.906-3.68L18.32 7.094A8 8 0 0 1 7.094 18.32ZM5.68 16.906A8 8 0 0 1 16.906 5.68L5.68 16.906Z");
    			add_location(path, file$3, 2, 2, 113);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$3, 1, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0],
    				{ viewBox: "0 0 24 24" },
    				{ fill: "currentColor" }
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Disabled', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Disabled extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Disabled",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    // get the label key from an option object or the option itself if it's a string or number
    const get_label = (opt) => {
        if (opt instanceof Object) {
            if (opt.label === undefined) {
                console.error(`MultiSelect option ${JSON.stringify(opt)} is an object but has no label key`);
            }
            return opt.label;
        }
        return `${opt}`;
    };
    function get_style(option, key = null) {
        if (!option?.style)
            return null;
        if (![`selected`, `option`, null].includes(key)) {
            console.error(`MultiSelect: Invalid key=${key} for get_style`);
            return;
        }
        if (typeof option == `object` && option.style) {
            if (typeof option.style == `string`) {
                return option.style;
            }
            if (typeof option.style == `object`) {
                if (key && key in option.style)
                    return option.style[key];
                else {
                    console.error(`Invalid style object for option=${JSON.stringify(option)}`);
                }
            }
        }
    }

    /* node_modules/svelte-multiselect/dist/MultiSelect.svelte generated by Svelte v3.59.2 */

    const { Boolean: Boolean_1, Object: Object_1, console: console_1$1 } = globals;
    const file$2 = "node_modules/svelte-multiselect/dist/MultiSelect.svelte";

    const get_user_msg_slot_changes = dirty => ({
    	searchText: dirty[0] & /*searchText*/ 8,
    	msgType: dirty[0] & /*duplicates, selected, searchText, allowUserOptions, createOptionMsg, matchingOptions, noMatchingOptionsMsg*/ 1073810458,
    	msg: dirty[0] & /*duplicateOptionMsg, createOptionMsg, noMatchingOptionsMsg, duplicates, selected, searchText, allowUserOptions, matchingOptions*/ 1073843226,
    	option: dirty[0] & /*matchingOptions, maxOptions*/ 33554434
    });

    const get_user_msg_slot_context = ctx => ({
    	searchText: /*searchText*/ ctx[3],
    	msgType: /*msgType*/ ctx[116],
    	msg: /*msg*/ ctx[117],
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    function get_if_ctx(ctx) {
    	const child_ctx = ctx.slice();

    	const constants_0 = ({
    		dupe: /*duplicateOptionMsg*/ child_ctx[15],
    		create: /*createOptionMsg*/ child_ctx[10],
    		'no-match': /*noMatchingOptionsMsg*/ child_ctx[30]
    	})[/*msgType*/ child_ctx[116]];

    	child_ctx[117] = constants_0;
    	return child_ctx;
    }

    function get_if_ctx_1(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*selected*/ child_ctx[4].map(get_label).includes(/*searchText*/ child_ctx[3]);
    	child_ctx[112] = constants_0;
    	const constants_1 = !/*duplicates*/ child_ctx[16] && /*text_input_is_duplicate*/ child_ctx[112] && `dupe`;
    	child_ctx[113] = constants_1;
    	const constants_2 = /*allowUserOptions*/ child_ctx[11] && /*createOptionMsg*/ child_ctx[10] && `create`;
    	child_ctx[114] = constants_2;
    	const constants_3 = /*matchingOptions*/ child_ctx[1]?.length == 0 && /*noMatchingOptionsMsg*/ child_ctx[30] && `no-match`;
    	child_ctx[115] = constants_3;
    	const constants_4 = /*is_dupe*/ child_ctx[113] || /*can_create*/ child_ctx[114] || /*no_match*/ child_ctx[115];
    	child_ctx[116] = constants_4;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[118] = list[i];
    	child_ctx[125] = i;

    	const constants_0 = /*option*/ child_ctx[118] instanceof Object
    	? /*option*/ child_ctx[118]
    	: { label: /*option*/ child_ctx[118] };

    	child_ctx[119] = constants_0.label;

    	child_ctx[42] = constants_0.disabled !== undefined
    	? constants_0.disabled
    	: null;

    	child_ctx[120] = constants_0.title !== undefined
    	? constants_0.title
    	: null;

    	child_ctx[121] = constants_0.selectedTitle !== undefined
    	? constants_0.selectedTitle
    	: null;

    	child_ctx[122] = constants_0.disabledTitle !== undefined
    	? constants_0.disabledTitle
    	: child_ctx[13];

    	const constants_1 = /*activeIndex*/ child_ctx[0] === /*idx*/ child_ctx[125];
    	child_ctx[123] = constants_1;
    	return child_ctx;
    }

    const get_default_slot_changes_1 = dirty => ({
    	option: dirty[0] & /*matchingOptions, maxOptions*/ 33554434
    });

    const get_default_slot_context_1 = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_option_slot_changes = dirty => ({
    	option: dirty[0] & /*matchingOptions, maxOptions*/ 33554434
    });

    const get_option_slot_context = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_remove_icon_slot_changes_1 = dirty => ({
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_remove_icon_slot_context_1 = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_disabled_icon_slot_changes = dirty => ({
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_disabled_icon_slot_context = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_spinner_slot_changes = dirty => ({
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_spinner_slot_context = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_after_input_slot_changes = dirty => ({
    	selected: dirty[0] & /*selected*/ 16,
    	disabled: dirty[1] & /*disabled*/ 2048,
    	invalid: dirty[0] & /*invalid*/ 128,
    	id: dirty[0] & /*id*/ 262144,
    	placeholder: dirty[1] & /*placeholder*/ 8,
    	open: dirty[0] & /*open*/ 256,
    	required: dirty[1] & /*required*/ 128,
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_after_input_slot_context = ctx => ({
    	selected: /*selected*/ ctx[4],
    	disabled: /*disabled*/ ctx[42],
    	invalid: /*invalid*/ ctx[7],
    	id: /*id*/ ctx[18],
    	placeholder: /*placeholder*/ ctx[34],
    	open: /*open*/ ctx[8],
    	required: /*required*/ ctx[38],
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[118] = list[i];
    	child_ctx[125] = i;
    	return child_ctx;
    }

    const get_remove_icon_slot_changes = dirty => ({
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_remove_icon_slot_context = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_default_slot_changes = dirty => ({
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_default_slot_context = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_selected_slot_changes = dirty => ({
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_selected_slot_context = ctx => ({
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    const get_expand_icon_slot_changes = dirty => ({
    	open: dirty[0] & /*open*/ 256,
    	option: dirty[0] & /*selected*/ 16,
    	idx: dirty[0] & /*selected*/ 16
    });

    const get_expand_icon_slot_context = ctx => ({
    	open: /*open*/ ctx[8],
    	option: /*option*/ ctx[118],
    	idx: /*idx*/ ctx[125]
    });

    // (443:34)      
    function fallback_block_9(ctx) {
    	let expandicon;
    	let current;

    	expandicon = new ChevronExpand({
    			props: {
    				width: "15px",
    				style: "min-width: 1em; padding: 0 1pt; cursor: pointer;"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(expandicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expandicon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expandicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expandicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expandicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_9.name,
    		type: "fallback",
    		source: "(443:34)      ",
    		ctx
    	});

    	return block;
    }

    // (466:12) {:else}
    function create_else_block_1(ctx) {
    	let t_value = get_label(/*option*/ ctx[118]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected*/ 16 && t_value !== (t_value = get_label(/*option*/ ctx[118]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(466:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (464:12) {#if parseLabelsAsHtml}
    function create_if_block_10(ctx) {
    	let html_tag;
    	let raw_value = get_label(/*option*/ ctx[118]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected*/ 16 && raw_value !== (raw_value = get_label(/*option*/ ctx[118]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(464:12) {#if parseLabelsAsHtml}",
    		ctx
    	});

    	return block;
    }

    // (463:31)              
    function fallback_block_8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*parseLabelsAsHtml*/ ctx[32]) return create_if_block_10;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_8.name,
    		type: "fallback",
    		source: "(463:31)              ",
    		ctx
    	});

    	return block;
    }

    // (462:45)            
    function fallback_block_7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[69].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[107], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block_8(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*selected*/ 16 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[107], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty[0] & /*selected*/ 16 | dirty[1] & /*parseLabelsAsHtml*/ 2)) {
    					default_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_7.name,
    		type: "fallback",
    		source: "(462:45)            ",
    		ctx
    	});

    	return block;
    }

    // (471:8) {#if !disabled && (minSelect === null || selected.length > minSelect)}
    function create_if_block_9(ctx) {
    	let button;
    	let button_title_value;
    	let current;
    	let mounted;
    	let dispose;
    	const remove_icon_slot_template = /*#slots*/ ctx[69]["remove-icon"];
    	const remove_icon_slot = create_slot(remove_icon_slot_template, ctx, /*$$scope*/ ctx[107], get_remove_icon_slot_context);
    	const remove_icon_slot_or_fallback = remove_icon_slot || fallback_block_6(ctx);

    	function mouseup_handler() {
    		return /*mouseup_handler*/ ctx[89](/*option*/ ctx[118]);
    	}

    	function keydown_handler_1() {
    		return /*keydown_handler_1*/ ctx[90](/*option*/ ctx[118]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (remove_icon_slot_or_fallback) remove_icon_slot_or_fallback.c();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "title", button_title_value = "" + (/*removeBtnTitle*/ ctx[36] + " " + get_label(/*option*/ ctx[118])));
    			attr_dev(button, "class", "remove svelte-1r2hsto");
    			add_location(button, file$2, 471, 10, 20104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (remove_icon_slot_or_fallback) {
    				remove_icon_slot_or_fallback.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "mouseup", stop_propagation(mouseup_handler), false, false, true, false),
    					listen_dev(
    						button,
    						"keydown",
    						function () {
    							if (is_function(/*if_enter_or_space*/ ctx[54](keydown_handler_1))) /*if_enter_or_space*/ ctx[54](keydown_handler_1).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (remove_icon_slot) {
    				if (remove_icon_slot.p && (!current || dirty[0] & /*selected*/ 16 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						remove_icon_slot,
    						remove_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(remove_icon_slot_template, /*$$scope*/ ctx[107], dirty, get_remove_icon_slot_changes),
    						get_remove_icon_slot_context
    					);
    				}
    			}

    			if (!current || dirty[0] & /*selected*/ 16 | dirty[1] & /*removeBtnTitle*/ 32 && button_title_value !== (button_title_value = "" + (/*removeBtnTitle*/ ctx[36] + " " + get_label(/*option*/ ctx[118])))) {
    				attr_dev(button, "title", button_title_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(remove_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(remove_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (remove_icon_slot_or_fallback) remove_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(471:8) {#if !disabled && (minSelect === null || selected.length > minSelect)}",
    		ctx
    	});

    	return block;
    }

    // (479:37)                
    function fallback_block_6(ctx) {
    	let crossicon;
    	let current;
    	crossicon = new Cross({ props: { width: "15px" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(crossicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(crossicon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crossicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crossicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(crossicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_6.name,
    		type: "fallback",
    		source: "(479:37)                ",
    		ctx
    	});

    	return block;
    }

    // (447:4) {#each selected as option, idx (duplicates ? [key(option), idx] : key(option))}
    function create_each_block_1(key_2, ctx) {
    	let li;
    	let t;
    	let li_class_value;
    	let li_draggable_value;
    	let li_style_value;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let mounted;
    	let dispose;
    	const selected_slot_template = /*#slots*/ ctx[69].selected;
    	const selected_slot = create_slot(selected_slot_template, ctx, /*$$scope*/ ctx[107], get_selected_slot_context);
    	const selected_slot_or_fallback = selected_slot || fallback_block_7(ctx);
    	let if_block = !/*disabled*/ ctx[42] && (/*minSelect*/ ctx[37] === null || /*selected*/ ctx[4].length > /*minSelect*/ ctx[37]) && create_if_block_9(ctx);

    	function dragenter_handler() {
    		return /*dragenter_handler*/ ctx[91](/*idx*/ ctx[125]);
    	}

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			li = element("li");
    			if (selected_slot_or_fallback) selected_slot_or_fallback.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*liSelectedClass*/ ctx[23]) + " svelte-1r2hsto"));
    			attr_dev(li, "role", "option");
    			attr_dev(li, "aria-selected", "true");
    			attr_dev(li, "draggable", li_draggable_value = /*selectedOptionsDraggable*/ ctx[39] && !/*disabled*/ ctx[42] && /*selected*/ ctx[4].length > 1);
    			attr_dev(li, "style", li_style_value = get_style(/*option*/ ctx[118], `selected`));
    			toggle_class(li, "active", /*drag_idx*/ ctx[46] === /*idx*/ ctx[125]);
    			add_location(li, file$2, 447, 6, 19178);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (selected_slot_or_fallback) {
    				selected_slot_or_fallback.m(li, null);
    			}

    			append_dev(li, t);
    			if (if_block) if_block.m(li, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						li,
    						"dragstart",
    						function () {
    							if (is_function(/*dragstart*/ ctx[57](/*idx*/ ctx[125]))) /*dragstart*/ ctx[57](/*idx*/ ctx[125]).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						li,
    						"drop",
    						prevent_default(function () {
    							if (is_function(/*drop*/ ctx[56](/*idx*/ ctx[125]))) /*drop*/ ctx[56](/*idx*/ ctx[125]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false,
    						false
    					),
    					listen_dev(li, "dragenter", dragenter_handler, false, false, false, false),
    					listen_dev(li, "dragover", prevent_default(/*dragover_handler*/ ctx[85]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (selected_slot) {
    				if (selected_slot.p && (!current || dirty[0] & /*selected*/ 16 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						selected_slot,
    						selected_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(selected_slot_template, /*$$scope*/ ctx[107], dirty, get_selected_slot_changes),
    						get_selected_slot_context
    					);
    				}
    			} else {
    				if (selected_slot_or_fallback && selected_slot_or_fallback.p && (!current || dirty[0] & /*selected*/ 16 | dirty[1] & /*parseLabelsAsHtml*/ 2 | dirty[3] & /*$$scope*/ 16384)) {
    					selected_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
    				}
    			}

    			if (!/*disabled*/ ctx[42] && (/*minSelect*/ ctx[37] === null || /*selected*/ ctx[4].length > /*minSelect*/ ctx[37])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*selected*/ 16 | dirty[1] & /*disabled, minSelect*/ 2112) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(li, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*liSelectedClass*/ 8388608 && li_class_value !== (li_class_value = "" + (null_to_empty(/*liSelectedClass*/ ctx[23]) + " svelte-1r2hsto"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 16 | dirty[1] & /*selectedOptionsDraggable, disabled*/ 2304 && li_draggable_value !== (li_draggable_value = /*selectedOptionsDraggable*/ ctx[39] && !/*disabled*/ ctx[42] && /*selected*/ ctx[4].length > 1)) {
    				attr_dev(li, "draggable", li_draggable_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 16 && li_style_value !== (li_style_value = get_style(/*option*/ ctx[118], `selected`))) {
    				attr_dev(li, "style", li_style_value);
    			}

    			if (!current || dirty[0] & /*liSelectedClass, selected*/ 8388624 | dirty[1] & /*drag_idx*/ 32768) {
    				toggle_class(li, "active", /*drag_idx*/ ctx[46] === /*idx*/ ctx[125]);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, { duration: 100 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selected_slot_or_fallback, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selected_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (selected_slot_or_fallback) selected_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(447:4) {#each selected as option, idx (duplicates ? [key(option), idx] : key(option))}",
    		ctx
    	});

    	return block;
    }

    // (528:2) {#if loading}
    function create_if_block_8(ctx) {
    	let current;
    	const spinner_slot_template = /*#slots*/ ctx[69].spinner;
    	const spinner_slot = create_slot(spinner_slot_template, ctx, /*$$scope*/ ctx[107], get_spinner_slot_context);
    	const spinner_slot_or_fallback = spinner_slot || fallback_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (spinner_slot_or_fallback) spinner_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (spinner_slot_or_fallback) {
    				spinner_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (spinner_slot) {
    				if (spinner_slot.p && (!current || dirty[0] & /*selected*/ 16 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						spinner_slot,
    						spinner_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(spinner_slot_template, /*$$scope*/ ctx[107], dirty, get_spinner_slot_changes),
    						get_spinner_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (spinner_slot_or_fallback) spinner_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(528:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (529:25)        
    function fallback_block_5(ctx) {
    	let circlespinner;
    	let current;
    	circlespinner = new CircleSpinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(circlespinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circlespinner, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circlespinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circlespinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circlespinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_5.name,
    		type: "fallback",
    		source: "(529:25)        ",
    		ctx
    	});

    	return block;
    }

    // (537:32) 
    function create_if_block_5(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*maxSelect*/ ctx[26] && (/*maxSelect*/ ctx[26] > 1 || /*maxSelectMsg*/ ctx[27]) && create_if_block_7(ctx);
    	let if_block1 = /*maxSelect*/ ctx[26] !== 1 && /*selected*/ ctx[4].length > 1 && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*maxSelect*/ ctx[26] && (/*maxSelect*/ ctx[26] > 1 || /*maxSelectMsg*/ ctx[27])) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*maxSelect, maxSelectMsg*/ 201326592) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*maxSelect*/ ctx[26] !== 1 && /*selected*/ ctx[4].length > 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*maxSelect, selected*/ 67108880) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(537:32) ",
    		ctx
    	});

    	return block;
    }

    // (533:2) {#if disabled}
    function create_if_block_4(ctx) {
    	let current;
    	const disabled_icon_slot_template = /*#slots*/ ctx[69]["disabled-icon"];
    	const disabled_icon_slot = create_slot(disabled_icon_slot_template, ctx, /*$$scope*/ ctx[107], get_disabled_icon_slot_context);
    	const disabled_icon_slot_or_fallback = disabled_icon_slot || fallback_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (disabled_icon_slot_or_fallback) disabled_icon_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (disabled_icon_slot_or_fallback) {
    				disabled_icon_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (disabled_icon_slot) {
    				if (disabled_icon_slot.p && (!current || dirty[0] & /*selected*/ 16 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						disabled_icon_slot,
    						disabled_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(disabled_icon_slot_template, /*$$scope*/ ctx[107], dirty, get_disabled_icon_slot_changes),
    						get_disabled_icon_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(disabled_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(disabled_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (disabled_icon_slot_or_fallback) disabled_icon_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(533:2) {#if disabled}",
    		ctx
    	});

    	return block;
    }

    // (538:4) {#if maxSelect && (maxSelect > 1 || maxSelectMsg)}
    function create_if_block_7(ctx) {
    	let wiggle_1;
    	let updating_wiggle;
    	let current;

    	function wiggle_1_wiggle_binding(value) {
    		/*wiggle_1_wiggle_binding*/ ctx[94](value);
    	}

    	let wiggle_1_props = {
    		angle: 20,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*wiggle*/ ctx[43] !== void 0) {
    		wiggle_1_props.wiggle = /*wiggle*/ ctx[43];
    	}

    	wiggle_1 = new Wiggle({ props: wiggle_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(wiggle_1, 'wiggle', wiggle_1_wiggle_binding));

    	const block = {
    		c: function create() {
    			create_component(wiggle_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wiggle_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wiggle_1_changes = {};

    			if (dirty[0] & /*maxSelectMsgClass, maxSelectMsg, selected, maxSelect*/ 469762064 | dirty[3] & /*$$scope*/ 16384) {
    				wiggle_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_wiggle && dirty[1] & /*wiggle*/ 4096) {
    				updating_wiggle = true;
    				wiggle_1_changes.wiggle = /*wiggle*/ ctx[43];
    				add_flush_callback(() => updating_wiggle = false);
    			}

    			wiggle_1.$set(wiggle_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wiggle_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wiggle_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wiggle_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(538:4) {#if maxSelect && (maxSelect > 1 || maxSelectMsg)}",
    		ctx
    	});

    	return block;
    }

    // (539:6) <Wiggle bind:wiggle angle={20}>
    function create_default_slot(ctx) {
    	let span;
    	let t_value = /*maxSelectMsg*/ ctx[27]?.(/*selected*/ ctx[4].length, /*maxSelect*/ ctx[26]) + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "max-select-msg " + /*maxSelectMsgClass*/ ctx[28] + " svelte-1r2hsto");
    			add_location(span, file$2, 539, 8, 21840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*maxSelectMsg, selected, maxSelect*/ 201326608 && t_value !== (t_value = /*maxSelectMsg*/ ctx[27]?.(/*selected*/ ctx[4].length, /*maxSelect*/ ctx[26]) + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*maxSelectMsgClass*/ 268435456 && span_class_value !== (span_class_value = "max-select-msg " + /*maxSelectMsgClass*/ ctx[28] + " svelte-1r2hsto")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(539:6) <Wiggle bind:wiggle angle={20}>",
    		ctx
    	});

    	return block;
    }

    // (545:4) {#if maxSelect !== 1 && selected.length > 1}
    function create_if_block_6(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const remove_icon_slot_template = /*#slots*/ ctx[69]["remove-icon"];
    	const remove_icon_slot = create_slot(remove_icon_slot_template, ctx, /*$$scope*/ ctx[107], get_remove_icon_slot_context_1);
    	const remove_icon_slot_or_fallback = remove_icon_slot || fallback_block_4(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (remove_icon_slot_or_fallback) remove_icon_slot_or_fallback.c();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "remove remove-all svelte-1r2hsto");
    			attr_dev(button, "title", /*removeAllTitle*/ ctx[35]);
    			add_location(button, file$2, 545, 6, 22042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (remove_icon_slot_or_fallback) {
    				remove_icon_slot_or_fallback.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "mouseup", stop_propagation(/*remove_all*/ ctx[53]), false, false, true, false),
    					listen_dev(button, "keydown", /*if_enter_or_space*/ ctx[54](/*remove_all*/ ctx[53]), false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (remove_icon_slot) {
    				if (remove_icon_slot.p && (!current || dirty[0] & /*selected*/ 16 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						remove_icon_slot,
    						remove_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(remove_icon_slot_template, /*$$scope*/ ctx[107], dirty, get_remove_icon_slot_changes_1),
    						get_remove_icon_slot_context_1
    					);
    				}
    			}

    			if (!current || dirty[1] & /*removeAllTitle*/ 16) {
    				attr_dev(button, "title", /*removeAllTitle*/ ctx[35]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(remove_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(remove_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (remove_icon_slot_or_fallback) remove_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(545:4) {#if maxSelect !== 1 && selected.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (553:33)            
    function fallback_block_4(ctx) {
    	let crossicon;
    	let current;
    	crossicon = new Cross({ props: { width: "15px" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(crossicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(crossicon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crossicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crossicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(crossicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_4.name,
    		type: "fallback",
    		source: "(553:33)            ",
    		ctx
    	});

    	return block;
    }

    // (534:31)        
    function fallback_block_3(ctx) {
    	let disabledicon;
    	let current;

    	disabledicon = new Disabled({
    			props: {
    				width: "14pt",
    				style: "margin: 0 2pt;",
    				"data-name": "disabled-icon"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(disabledicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(disabledicon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(disabledicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(disabledicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(disabledicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(534:31)        ",
    		ctx
    	});

    	return block;
    }

    // (561:2) {#if (searchText && noMatchingOptionsMsg) || options?.length > 0}
    function create_if_block$1(ctx) {
    	let ul;
    	let t;
    	let ul_class_value;
    	let ul_aria_multiselectable_value;
    	let ul_aria_disabled_value;
    	let current;
    	let each_value = /*matchingOptions*/ ctx[1].slice(0, Math.max(0, /*maxOptions*/ ctx[25] ?? 0) || Infinity);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*searchText*/ ctx[3] && create_if_block_1(get_if_ctx_1(ctx));

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", ul_class_value = "options " + /*ulOptionsClass*/ ctx[40] + " svelte-1r2hsto");
    			attr_dev(ul, "role", "listbox");
    			attr_dev(ul, "aria-multiselectable", ul_aria_multiselectable_value = /*maxSelect*/ ctx[26] === null || /*maxSelect*/ ctx[26] > 1);
    			attr_dev(ul, "aria-expanded", /*open*/ ctx[8]);
    			attr_dev(ul, "aria-disabled", ul_aria_disabled_value = /*disabled*/ ctx[42] ? `true` : null);
    			toggle_class(ul, "hidden", !/*open*/ ctx[8]);
    			add_location(ul, file$2, 561, 4, 22566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(ul, t);
    			if (if_block) if_block.m(ul, null);
    			/*ul_binding*/ ctx[105](ul);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matchingOptions, maxOptions, liOptionClass, activeIndex, liActiveOptionClass*/ 39845891 | dirty[1] & /*is_selected, add, parseLabelsAsHtml*/ 393218 | dirty[3] & /*$$scope*/ 16384) {
    				each_value = /*matchingOptions*/ ctx[1].slice(0, Math.max(0, /*maxOptions*/ ctx[25] ?? 0) || Infinity);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*searchText*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(get_if_ctx_1(ctx), dirty);

    					if (dirty[0] & /*searchText*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(get_if_ctx_1(ctx));
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[1] & /*ulOptionsClass*/ 512 && ul_class_value !== (ul_class_value = "options " + /*ulOptionsClass*/ ctx[40] + " svelte-1r2hsto")) {
    				attr_dev(ul, "class", ul_class_value);
    			}

    			if (!current || dirty[0] & /*maxSelect*/ 67108864 && ul_aria_multiselectable_value !== (ul_aria_multiselectable_value = /*maxSelect*/ ctx[26] === null || /*maxSelect*/ ctx[26] > 1)) {
    				attr_dev(ul, "aria-multiselectable", ul_aria_multiselectable_value);
    			}

    			if (!current || dirty[0] & /*open*/ 256) {
    				attr_dev(ul, "aria-expanded", /*open*/ ctx[8]);
    			}

    			if (!current || dirty[1] & /*disabled*/ 2048 && ul_aria_disabled_value !== (ul_aria_disabled_value = /*disabled*/ ctx[42] ? `true` : null)) {
    				attr_dev(ul, "aria-disabled", ul_aria_disabled_value);
    			}

    			if (!current || dirty[0] & /*open*/ 256 | dirty[1] & /*ulOptionsClass*/ 512) {
    				toggle_class(ul, "hidden", !/*open*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			/*ul_binding*/ ctx[105](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(561:2) {#if (searchText && noMatchingOptionsMsg) || options?.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (608:14) {:else}
    function create_else_block(ctx) {
    	let t_value = get_label(/*option*/ ctx[118]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matchingOptions, maxOptions*/ 33554434 && t_value !== (t_value = get_label(/*option*/ ctx[118]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(608:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (606:14) {#if parseLabelsAsHtml}
    function create_if_block_3(ctx) {
    	let html_tag;
    	let raw_value = get_label(/*option*/ ctx[118]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matchingOptions, maxOptions*/ 33554434 && raw_value !== (raw_value = get_label(/*option*/ ctx[118]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(606:14) {#if parseLabelsAsHtml}",
    		ctx
    	});

    	return block;
    }

    // (605:33)                
    function fallback_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*parseLabelsAsHtml*/ ctx[32]) return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(605:33)                ",
    		ctx
    	});

    	return block;
    }

    // (604:45)              
    function fallback_block_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[69].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[107], get_default_slot_context_1);
    	const default_slot_or_fallback = default_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*matchingOptions, maxOptions*/ 33554434 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[107], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty[0] & /*matchingOptions, maxOptions*/ 33554434 | dirty[1] & /*parseLabelsAsHtml*/ 2)) {
    					default_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(604:45)              ",
    		ctx
    	});

    	return block;
    }

    // (571:6) {#each matchingOptions.slice(0, Math.max(0, maxOptions ?? 0) || Infinity) as option, idx}
    function create_each_block$1(ctx) {
    	let li;
    	let li_title_value;
    	let li_class_value;
    	let li_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const option_slot_template = /*#slots*/ ctx[69].option;
    	const option_slot = create_slot(option_slot_template, ctx, /*$$scope*/ ctx[107], get_option_slot_context);
    	const option_slot_or_fallback = option_slot || fallback_block_1(ctx);

    	function mouseup_handler_1(...args) {
    		return /*mouseup_handler_1*/ ctx[95](/*disabled*/ ctx[42], /*option*/ ctx[118], ...args);
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[96](/*disabled*/ ctx[42], /*idx*/ ctx[125]);
    	}

    	function focus_handler_1() {
    		return /*focus_handler_1*/ ctx[97](/*disabled*/ ctx[42], /*idx*/ ctx[125]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (option_slot_or_fallback) option_slot_or_fallback.c();

    			attr_dev(li, "title", li_title_value = /*disabled*/ ctx[42]
    			? /*disabledTitle*/ ctx[122]
    			: /*is_selected*/ ctx[48](/*label*/ ctx[119]) && /*selectedTitle*/ ctx[121] || /*title*/ ctx[120]);

    			attr_dev(li, "class", li_class_value = "" + (/*liOptionClass*/ ctx[22] + " " + (/*active*/ ctx[123]
    			? /*liActiveOptionClass*/ ctx[21]
    			: ``) + " svelte-1r2hsto"));

    			attr_dev(li, "role", "option");
    			attr_dev(li, "aria-selected", "false");
    			attr_dev(li, "style", li_style_value = get_style(/*option*/ ctx[118], `option`));
    			toggle_class(li, "selected", /*is_selected*/ ctx[48](/*label*/ ctx[119]));
    			toggle_class(li, "active", /*active*/ ctx[123]);
    			toggle_class(li, "disabled", /*disabled*/ ctx[42]);
    			add_location(li, file$2, 579, 8, 23214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (option_slot_or_fallback) {
    				option_slot_or_fallback.m(li, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "mousedown", stop_propagation(/*mousedown_handler_1*/ ctx[71]), false, false, true, false),
    					listen_dev(li, "mouseup", stop_propagation(mouseup_handler_1), false, false, true, false),
    					listen_dev(li, "mouseover", mouseover_handler, false, false, false, false),
    					listen_dev(li, "focus", focus_handler_1, false, false, false, false),
    					listen_dev(li, "mouseout", /*mouseout_handler*/ ctx[98], false, false, false, false),
    					listen_dev(li, "blur", /*blur_handler_1*/ ctx[99], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (option_slot) {
    				if (option_slot.p && (!current || dirty[0] & /*matchingOptions, maxOptions*/ 33554434 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						option_slot,
    						option_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(option_slot_template, /*$$scope*/ ctx[107], dirty, get_option_slot_changes),
    						get_option_slot_context
    					);
    				}
    			} else {
    				if (option_slot_or_fallback && option_slot_or_fallback.p && (!current || dirty[0] & /*matchingOptions, maxOptions*/ 33554434 | dirty[1] & /*parseLabelsAsHtml*/ 2 | dirty[3] & /*$$scope*/ 16384)) {
    					option_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*matchingOptions, maxOptions*/ 33554434 | dirty[1] & /*is_selected*/ 131072 && li_title_value !== (li_title_value = /*disabled*/ ctx[42]
    			? /*disabledTitle*/ ctx[122]
    			: /*is_selected*/ ctx[48](/*label*/ ctx[119]) && /*selectedTitle*/ ctx[121] || /*title*/ ctx[120])) {
    				attr_dev(li, "title", li_title_value);
    			}

    			if (!current || dirty[0] & /*liOptionClass, activeIndex, liActiveOptionClass*/ 6291457 && li_class_value !== (li_class_value = "" + (/*liOptionClass*/ ctx[22] + " " + (/*active*/ ctx[123]
    			? /*liActiveOptionClass*/ ctx[21]
    			: ``) + " svelte-1r2hsto"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (!current || dirty[0] & /*matchingOptions, maxOptions*/ 33554434 && li_style_value !== (li_style_value = get_style(/*option*/ ctx[118], `option`))) {
    				attr_dev(li, "style", li_style_value);
    			}

    			if (!current || dirty[0] & /*liOptionClass, activeIndex, liActiveOptionClass, matchingOptions, maxOptions*/ 39845891 | dirty[1] & /*is_selected*/ 131072) {
    				toggle_class(li, "selected", /*is_selected*/ ctx[48](/*label*/ ctx[119]));
    			}

    			if (!current || dirty[0] & /*liOptionClass, activeIndex, liActiveOptionClass, activeIndex*/ 6291457) {
    				toggle_class(li, "active", /*active*/ ctx[123]);
    			}

    			if (!current || dirty[0] & /*liOptionClass, activeIndex, liActiveOptionClass, matchingOptions, maxOptions*/ 39845891) {
    				toggle_class(li, "disabled", /*disabled*/ ctx[42]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(option_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(option_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (option_slot_or_fallback) option_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(571:6) {#each matchingOptions.slice(0, Math.max(0, maxOptions ?? 0) || Infinity) as option, idx}",
    		ctx
    	});

    	return block;
    }

    // (615:6) {#if searchText}
    function create_if_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*msgType*/ ctx[116] && create_if_block_2(get_if_ctx(ctx));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*msgType*/ ctx[116]) {
    				if (if_block) {
    					if_block.p(get_if_ctx(ctx), dirty);

    					if (dirty[0] & /*duplicates, selected, searchText, allowUserOptions, createOptionMsg, matchingOptions, noMatchingOptionsMsg*/ 1073810458) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(get_if_ctx(ctx));
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(615:6) {#if searchText}",
    		ctx
    	});

    	return block;
    }

    // (622:8) {#if msgType}
    function create_if_block_2(ctx) {
    	let li;
    	let current;
    	let mounted;
    	let dispose;
    	const user_msg_slot_template = /*#slots*/ ctx[69]["user-msg"];
    	const user_msg_slot = create_slot(user_msg_slot_template, ctx, /*$$scope*/ ctx[107], get_user_msg_slot_context);
    	const user_msg_slot_or_fallback = user_msg_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (user_msg_slot_or_fallback) user_msg_slot_or_fallback.c();
    			attr_dev(li, "title", /*createOptionMsg*/ ctx[10]);
    			attr_dev(li, "role", "option");
    			attr_dev(li, "aria-selected", "false");
    			attr_dev(li, "class", "user-msg svelte-1r2hsto");
    			toggle_class(li, "active", /*option_msg_is_active*/ ctx[44]);

    			set_style(li, "cursor", ({
    				dupe: `not-allowed`,
    				create: `pointer`,
    				'no-match': `default`
    			})[/*msgType*/ ctx[116]]);

    			add_location(li, file$2, 627, 10, 24969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (user_msg_slot_or_fallback) {
    				user_msg_slot_or_fallback.m(li, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "mousedown", stop_propagation(/*mousedown_handler_2*/ ctx[70]), false, false, true, false),
    					listen_dev(li, "mouseup", stop_propagation(/*mouseup_handler_2*/ ctx[100]), false, false, true, false),
    					listen_dev(li, "mouseover", /*mouseover_handler_1*/ ctx[101], false, false, false, false),
    					listen_dev(li, "focus", /*focus_handler_2*/ ctx[102], false, false, false, false),
    					listen_dev(li, "mouseout", /*mouseout_handler_1*/ ctx[103], false, false, false, false),
    					listen_dev(li, "blur", /*blur_handler_2*/ ctx[104], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (user_msg_slot) {
    				if (user_msg_slot.p && (!current || dirty[0] & /*searchText, duplicates, selected, allowUserOptions, createOptionMsg, matchingOptions, noMatchingOptionsMsg, duplicateOptionMsg, maxOptions*/ 1107397658 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						user_msg_slot,
    						user_msg_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(user_msg_slot_template, /*$$scope*/ ctx[107], dirty, get_user_msg_slot_changes),
    						get_user_msg_slot_context
    					);
    				}
    			} else {
    				if (user_msg_slot_or_fallback && user_msg_slot_or_fallback.p && (!current || dirty[0] & /*duplicateOptionMsg, createOptionMsg, noMatchingOptionsMsg, duplicates, selected, searchText, allowUserOptions, matchingOptions*/ 1073843226)) {
    					user_msg_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*createOptionMsg*/ 1024) {
    				attr_dev(li, "title", /*createOptionMsg*/ ctx[10]);
    			}

    			if (!current || dirty[1] & /*option_msg_is_active*/ 8192) {
    				toggle_class(li, "active", /*option_msg_is_active*/ ctx[44]);
    			}

    			if (dirty[0] & /*duplicates, selected, searchText, allowUserOptions, createOptionMsg, matchingOptions, noMatchingOptionsMsg*/ 1073810458) {
    				set_style(li, "cursor", ({
    					dupe: `not-allowed`,
    					create: `pointer`,
    					'no-match': `default`
    				})[/*msgType*/ ctx[116]]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(user_msg_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(user_msg_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (user_msg_slot_or_fallback) user_msg_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(622:8) {#if msgType}",
    		ctx
    	});

    	return block;
    }

    // (648:63)                
    function fallback_block(ctx) {
    	let t_value = /*msg*/ ctx[117] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*duplicateOptionMsg, createOptionMsg, noMatchingOptionsMsg, duplicates, selected, searchText, allowUserOptions, matchingOptions*/ 1073843226 && t_value !== (t_value = /*msg*/ ctx[117] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(648:63)                ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let input0;
    	let input0_required_value;
    	let input0_value_value;
    	let t0;
    	let t1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let input1;
    	let input1_class_value;
    	let input1_placeholder_value;
    	let input1_aria_invalid_value;
    	let t3;
    	let ul_class_value;
    	let t4;
    	let t5;
    	let current_block_type_index;
    	let if_block1;
    	let t6;
    	let div_class_value;
    	let div_title_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[86]);
    	const expand_icon_slot_template = /*#slots*/ ctx[69]["expand-icon"];
    	const expand_icon_slot = create_slot(expand_icon_slot_template, ctx, /*$$scope*/ ctx[107], get_expand_icon_slot_context);
    	const expand_icon_slot_or_fallback = expand_icon_slot || fallback_block_9(ctx);
    	let each_value_1 = /*selected*/ ctx[4];
    	validate_each_argument(each_value_1);

    	const get_key = ctx => /*duplicates*/ ctx[16]
    	? [/*key*/ ctx[17](/*option*/ ctx[118]), /*idx*/ ctx[125]]
    	: /*key*/ ctx[17](/*option*/ ctx[118]);

    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const after_input_slot_template = /*#slots*/ ctx[69]["after-input"];
    	const after_input_slot = create_slot(after_input_slot_template, ctx, /*$$scope*/ ctx[107], get_after_input_slot_context);
    	let if_block0 = /*loading*/ ctx[24] && create_if_block_8(ctx);
    	const if_block_creators = [create_if_block_4, create_if_block_5];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*disabled*/ ctx[42]) return 0;
    		if (/*selected*/ ctx[4].length > 0) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block2 = (/*searchText*/ ctx[3] && /*noMatchingOptionsMsg*/ ctx[30] || /*options*/ ctx[2]?.length > 0) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			if (expand_icon_slot_or_fallback) expand_icon_slot_or_fallback.c();
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			if (after_input_slot) after_input_slot.c();
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(input0, "name", /*name*/ ctx[29]);
    			input0.required = input0_required_value = Boolean(/*required*/ ctx[38]);

    			input0.value = input0_value_value = /*selected*/ ctx[4].length >= Number(/*required*/ ctx[38])
    			? JSON.stringify(/*selected*/ ctx[4])
    			: null;

    			attr_dev(input0, "tabindex", "-1");
    			attr_dev(input0, "aria-hidden", "true");
    			attr_dev(input0, "aria-label", "ignore this, used only to prevent form submission if select is required but empty");
    			attr_dev(input0, "class", "form-control svelte-1r2hsto");
    			add_location(input0, file$2, 420, 2, 18143);
    			attr_dev(input1, "class", input1_class_value = "" + (null_to_empty(/*inputClass*/ ctx[19]) + " svelte-1r2hsto"));
    			attr_dev(input1, "id", /*id*/ ctx[18]);
    			input1.disabled = /*disabled*/ ctx[42];
    			attr_dev(input1, "autocomplete", /*autocomplete*/ ctx[12]);
    			attr_dev(input1, "inputmode", /*inputmode*/ ctx[20]);
    			attr_dev(input1, "pattern", /*pattern*/ ctx[33]);

    			attr_dev(input1, "placeholder", input1_placeholder_value = /*selected*/ ctx[4].length == 0
    			? /*placeholder*/ ctx[34]
    			: null);

    			attr_dev(input1, "aria-invalid", input1_aria_invalid_value = /*invalid*/ ctx[7] ? `true` : null);
    			attr_dev(input1, "ondrop", "return false");
    			add_location(input1, file$2, 485, 4, 20522);
    			attr_dev(ul, "class", ul_class_value = "selected " + /*ulSelectedClass*/ ctx[41] + " svelte-1r2hsto");
    			attr_dev(ul, "aria-label", "selected options");
    			add_location(ul, file$2, 445, 2, 19018);
    			attr_dev(div, "class", div_class_value = "multiselect " + /*outerDivClass*/ ctx[31] + " svelte-1r2hsto");

    			attr_dev(div, "title", div_title_value = /*disabled*/ ctx[42]
    			? /*disabledInputTitle*/ ctx[14]
    			: null);

    			attr_dev(div, "data-id", /*id*/ ctx[18]);
    			attr_dev(div, "role", "searchbox");
    			attr_dev(div, "tabindex", "-1");
    			toggle_class(div, "disabled", /*disabled*/ ctx[42]);
    			toggle_class(div, "single", /*maxSelect*/ ctx[26] === 1);
    			toggle_class(div, "open", /*open*/ ctx[8]);
    			toggle_class(div, "invalid", /*invalid*/ ctx[7]);
    			add_location(div, file$2, 405, 0, 17607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			/*input0_binding*/ ctx[87](input0);
    			append_dev(div, t0);

    			if (expand_icon_slot_or_fallback) {
    				expand_icon_slot_or_fallback.m(div, null);
    			}

    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(ul, t2);
    			append_dev(ul, input1);
    			/*input1_binding*/ ctx[92](input1);
    			set_input_value(input1, /*searchText*/ ctx[3]);
    			append_dev(ul, t3);

    			if (after_input_slot) {
    				after_input_slot.m(ul, null);
    			}

    			append_dev(div, t4);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			append_dev(div, t6);
    			if (if_block2) if_block2.m(div, null);
    			/*div_binding*/ ctx[106](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*on_click_outside*/ ctx[55], false, false, false, false),
    					listen_dev(window, "touchstart", /*on_click_outside*/ ctx[55], false, false, false, false),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[86]),
    					listen_dev(input0, "invalid", /*invalid_handler*/ ctx[88], false, false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[93]),
    					listen_dev(input1, "mouseup", self(stop_propagation(/*open_dropdown*/ ctx[51])), false, false, true, false),
    					listen_dev(input1, "keydown", stop_propagation(/*handle_keydown*/ ctx[52]), false, false, true, false),
    					listen_dev(input1, "focus", /*focus_handler*/ ctx[72], false, false, false, false),
    					listen_dev(input1, "focus", /*open_dropdown*/ ctx[51], false, false, false, false),
    					listen_dev(input1, "input", /*highlight_matching_options*/ ctx[58], false, false, false, false),
    					listen_dev(input1, "blur", /*blur_handler*/ ctx[73], false, false, false, false),
    					listen_dev(input1, "change", /*change_handler*/ ctx[74], false, false, false, false),
    					listen_dev(input1, "click", /*click_handler*/ ctx[75], false, false, false, false),
    					listen_dev(input1, "keydown", /*keydown_handler*/ ctx[76], false, false, false, false),
    					listen_dev(input1, "keyup", /*keyup_handler*/ ctx[77], false, false, false, false),
    					listen_dev(input1, "mousedown", /*mousedown_handler*/ ctx[78], false, false, false, false),
    					listen_dev(input1, "mouseenter", /*mouseenter_handler*/ ctx[79], false, false, false, false),
    					listen_dev(input1, "mouseleave", /*mouseleave_handler*/ ctx[80], false, false, false, false),
    					listen_dev(input1, "touchcancel", /*touchcancel_handler*/ ctx[81], false, false, false, false),
    					listen_dev(input1, "touchend", /*touchend_handler*/ ctx[82], false, false, false, false),
    					listen_dev(input1, "touchmove", /*touchmove_handler*/ ctx[83], false, false, false, false),
    					listen_dev(input1, "touchstart", /*touchstart_handler*/ ctx[84], false, false, false, false),
    					listen_dev(div, "mouseup", stop_propagation(/*open_dropdown*/ ctx[51]), false, false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*name*/ 536870912) {
    				attr_dev(input0, "name", /*name*/ ctx[29]);
    			}

    			if (!current || dirty[1] & /*required*/ 128 && input0_required_value !== (input0_required_value = Boolean(/*required*/ ctx[38]))) {
    				prop_dev(input0, "required", input0_required_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 16 | dirty[1] & /*required*/ 128 && input0_value_value !== (input0_value_value = /*selected*/ ctx[4].length >= Number(/*required*/ ctx[38])
    			? JSON.stringify(/*selected*/ ctx[4])
    			: null) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (expand_icon_slot) {
    				if (expand_icon_slot.p && (!current || dirty[0] & /*open, selected*/ 272 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						expand_icon_slot,
    						expand_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(expand_icon_slot_template, /*$$scope*/ ctx[107], dirty, get_expand_icon_slot_changes),
    						get_expand_icon_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*liSelectedClass, selected, duplicates, key*/ 8585232 | dirty[1] & /*selectedOptionsDraggable, disabled, drag_idx, dragstart, drop, removeBtnTitle, remove, if_enter_or_space, minSelect, parseLabelsAsHtml*/ 109611362 | dirty[3] & /*$$scope*/ 16384) {
    				each_value_1 = /*selected*/ ctx[4];
    				validate_each_argument(each_value_1);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block_1, t2, get_each_context_1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (!current || dirty[0] & /*inputClass*/ 524288 && input1_class_value !== (input1_class_value = "" + (null_to_empty(/*inputClass*/ ctx[19]) + " svelte-1r2hsto"))) {
    				attr_dev(input1, "class", input1_class_value);
    			}

    			if (!current || dirty[0] & /*id*/ 262144) {
    				attr_dev(input1, "id", /*id*/ ctx[18]);
    			}

    			if (!current || dirty[1] & /*disabled*/ 2048) {
    				prop_dev(input1, "disabled", /*disabled*/ ctx[42]);
    			}

    			if (!current || dirty[0] & /*autocomplete*/ 4096) {
    				attr_dev(input1, "autocomplete", /*autocomplete*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*inputmode*/ 1048576) {
    				attr_dev(input1, "inputmode", /*inputmode*/ ctx[20]);
    			}

    			if (!current || dirty[1] & /*pattern*/ 4) {
    				attr_dev(input1, "pattern", /*pattern*/ ctx[33]);
    			}

    			if (!current || dirty[0] & /*selected*/ 16 | dirty[1] & /*placeholder*/ 8 && input1_placeholder_value !== (input1_placeholder_value = /*selected*/ ctx[4].length == 0
    			? /*placeholder*/ ctx[34]
    			: null)) {
    				attr_dev(input1, "placeholder", input1_placeholder_value);
    			}

    			if (!current || dirty[0] & /*invalid*/ 128 && input1_aria_invalid_value !== (input1_aria_invalid_value = /*invalid*/ ctx[7] ? `true` : null)) {
    				attr_dev(input1, "aria-invalid", input1_aria_invalid_value);
    			}

    			if (dirty[0] & /*searchText*/ 8 && input1.value !== /*searchText*/ ctx[3]) {
    				set_input_value(input1, /*searchText*/ ctx[3]);
    			}

    			if (after_input_slot) {
    				if (after_input_slot.p && (!current || dirty[0] & /*selected, invalid, id, open*/ 262544 | dirty[1] & /*disabled, placeholder, required*/ 2184 | dirty[3] & /*$$scope*/ 16384)) {
    					update_slot_base(
    						after_input_slot,
    						after_input_slot_template,
    						ctx,
    						/*$$scope*/ ctx[107],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[107])
    						: get_slot_changes(after_input_slot_template, /*$$scope*/ ctx[107], dirty, get_after_input_slot_changes),
    						get_after_input_slot_context
    					);
    				}
    			}

    			if (!current || dirty[1] & /*ulSelectedClass*/ 1024 && ul_class_value !== (ul_class_value = "selected " + /*ulSelectedClass*/ ctx[41] + " svelte-1r2hsto")) {
    				attr_dev(ul, "class", ul_class_value);
    			}

    			if (/*loading*/ ctx[24]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*loading*/ 16777216) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t5);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div, t6);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (/*searchText*/ ctx[3] && /*noMatchingOptionsMsg*/ ctx[30] || /*options*/ ctx[2]?.length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*searchText, noMatchingOptionsMsg, options*/ 1073741836) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[1] & /*outerDivClass*/ 1 && div_class_value !== (div_class_value = "multiselect " + /*outerDivClass*/ ctx[31] + " svelte-1r2hsto")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*disabledInputTitle*/ 16384 | dirty[1] & /*disabled*/ 2048 && div_title_value !== (div_title_value = /*disabled*/ ctx[42]
    			? /*disabledInputTitle*/ ctx[14]
    			: null)) {
    				attr_dev(div, "title", div_title_value);
    			}

    			if (!current || dirty[0] & /*id*/ 262144) {
    				attr_dev(div, "data-id", /*id*/ ctx[18]);
    			}

    			if (!current || dirty[1] & /*outerDivClass, disabled*/ 2049) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[42]);
    			}

    			if (!current || dirty[0] & /*maxSelect*/ 67108864 | dirty[1] & /*outerDivClass*/ 1) {
    				toggle_class(div, "single", /*maxSelect*/ ctx[26] === 1);
    			}

    			if (!current || dirty[0] & /*open*/ 256 | dirty[1] & /*outerDivClass*/ 1) {
    				toggle_class(div, "open", /*open*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*invalid*/ 128 | dirty[1] & /*outerDivClass*/ 1) {
    				toggle_class(div, "invalid", /*invalid*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expand_icon_slot_or_fallback, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(after_input_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expand_icon_slot_or_fallback, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(after_input_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input0_binding*/ ctx[87](null);
    			if (expand_icon_slot_or_fallback) expand_icon_slot_or_fallback.d(detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*input1_binding*/ ctx[92](null);
    			if (after_input_slot) after_input_slot.d(detaching);
    			if (if_block0) if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block2) if_block2.d();
    			/*div_binding*/ ctx[106](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let is_selected;
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots('MultiSelect', slots, [
    		'expand-icon','default','selected','remove-icon','after-input','spinner','disabled-icon','option','user-msg'
    	]);

    	let { activeIndex = null } = $$props;
    	let { activeOption = null } = $$props;
    	let { createOptionMsg = `Create this option...` } = $$props;
    	let { allowUserOptions = false } = $$props;
    	let { allowEmpty = false } = $$props;
    	let { autocomplete = `off` } = $$props;
    	let { autoScroll = true } = $$props;
    	let { breakpoint = 800 } = $$props;
    	let { defaultDisabledTitle = `This option is disabled` } = $$props;
    	let { disabled = false } = $$props;
    	let { disabledInputTitle = `This input is disabled` } = $$props;
    	let { duplicateOptionMsg = `This option is already selected` } = $$props;
    	let { duplicates = false } = $$props;
    	let { key = opt => `${get_label(opt)}`.toLowerCase() } = $$props;

    	let { filterFunc = (opt, searchText) => {
    		if (!searchText) return true;
    		return `${get_label(opt)}`.toLowerCase().includes(searchText.toLowerCase());
    	} } = $$props;

    	let { focusInputOnSelect = `desktop` } = $$props;
    	let { form_input = null } = $$props;
    	let { highlightMatches = true } = $$props;
    	let { id = null } = $$props;
    	let { input = null } = $$props;
    	let { inputClass = `` } = $$props;
    	let { inputmode = null } = $$props;
    	let { invalid = false } = $$props;
    	let { liActiveOptionClass = `` } = $$props;
    	let { liOptionClass = `` } = $$props;
    	let { liSelectedClass = `` } = $$props;
    	let { loading = false } = $$props;
    	let { matchingOptions = [] } = $$props;
    	let { maxOptions = undefined } = $$props;
    	let { maxSelect = null } = $$props;
    	let { maxSelectMsg = (current, max) => max > 1 ? `${current}/${max}` : `` } = $$props;
    	let { maxSelectMsgClass = `` } = $$props;
    	let { name = null } = $$props;
    	let { noMatchingOptionsMsg = `No matching options` } = $$props;
    	let { open = false } = $$props;
    	let { options } = $$props;
    	let { outerDiv = null } = $$props;
    	let { outerDivClass = `` } = $$props;
    	let { parseLabelsAsHtml = false } = $$props;
    	let { pattern = null } = $$props;
    	let { placeholder = null } = $$props;
    	let { removeAllTitle = `Remove all` } = $$props;
    	let { removeBtnTitle = `Remove` } = $$props;
    	let { minSelect = null } = $$props;
    	let { required = false } = $$props;
    	let { resetFilterOnAdd = true } = $$props;
    	let { searchText = `` } = $$props;
    	let { selected = options?.filter(opt => opt instanceof Object && opt?.preselected).slice(0, maxSelect ?? undefined) ?? [] } = $$props;
    	let { sortSelected = false } = $$props;
    	let { selectedOptionsDraggable = !sortSelected } = $$props;
    	let { ulOptionsClass = `` } = $$props;
    	let { ulSelectedClass = `` } = $$props;
    	let { value = null } = $$props;

    	const selected_to_value = selected => {
    		$$invalidate(59, value = maxSelect === 1 ? selected[0] ?? null : selected);
    	};

    	const value_to_selected = value => {
    		if (maxSelect === 1) $$invalidate(4, selected = value ? [value] : []); else $$invalidate(4, selected = value ?? []);
    	};

    	let wiggle = false; // controls wiggle animation when user tries to exceed maxSelect

    	if (!(options?.length > 0)) {
    		if (allowUserOptions || loading || disabled || allowEmpty) {
    			options = []; // initializing as array avoids errors when component mounts
    		} else {
    			// error on empty options if user is not allowed to create custom options and loading is false
    			// and component is not disabled and allowEmpty is false
    			console.error(`MultiSelect received no options`);
    		}
    	}

    	if (maxSelect !== null && maxSelect < 1) {
    		console.error(`MultiSelect's maxSelect must be null or positive integer, got ${maxSelect}`);
    	}

    	if (!Array.isArray(selected)) {
    		console.error(`MultiSelect's selected prop should always be an array, got ${selected}`);
    	}

    	if (maxSelect && typeof required === `number` && required > maxSelect) {
    		console.error(`MultiSelect maxSelect=${maxSelect} < required=${required}, makes it impossible for users to submit a valid form`);
    	}

    	if (parseLabelsAsHtml && allowUserOptions) {
    		console.warn(`Don't combine parseLabelsAsHtml and allowUserOptions. It's susceptible to XSS attacks!`);
    	}

    	if (sortSelected && selectedOptionsDraggable) {
    		console.warn(`MultiSelect's sortSelected and selectedOptionsDraggable should not be combined as any ` + `user re-orderings of selected options will be undone by sortSelected on component re-renders.`);
    	}

    	if (allowUserOptions && !createOptionMsg && createOptionMsg !== null) {
    		console.error(`MultiSelect has allowUserOptions=${allowUserOptions} but createOptionMsg=${createOptionMsg} is falsy. ` + `This prevents the "Add option" <span> from showing up, resulting in a confusing user experience.`);
    	}

    	if (maxOptions && (typeof maxOptions != `number` || maxOptions < 0 || maxOptions % 1 != 0)) {
    		console.error(`MultiSelect's maxOptions must be undefined or a positive integer, got ${maxOptions}`);
    	}

    	const dispatch = createEventDispatcher();
    	let option_msg_is_active = false; // controls active state of <li>{createOptionMsg}</li>
    	let window_width;

    	// raise if matchingOptions[activeIndex] does not yield a value
    	if (activeIndex !== null && !matchingOptions[activeIndex]) {
    		throw `Run time error, activeIndex=${activeIndex} is out of bounds, matchingOptions.length=${matchingOptions.length}`;
    	}

    	// add an option to selected list
    	function add(option, event) {
    		if (maxSelect && maxSelect > 1 && selected.length >= maxSelect) $$invalidate(43, wiggle = true);

    		if (!isNaN(Number(option)) && typeof selected.map(get_label)[0] === `number`) {
    			option = Number(option); // convert to number if possible
    		}

    		const is_duplicate = selected.map(key).includes(key(option));

    		if ((maxSelect === null || maxSelect === 1 || selected.length < maxSelect) && (duplicates || !is_duplicate)) {
    			if (!options.includes(option) && // first check if we find option in the options list
    			// this has the side-effect of not allowing to user to add the same
    			// custom option twice in append mode
    			[true, `append`].includes(allowUserOptions) && searchText.length > 0) {
    				// user entered text but no options match, so if allowUserOptions = true | 'append', we create
    				// a new option from the user-entered text
    				if (typeof options[0] === `object`) {
    					// if 1st option is an object, we create new option as object to keep type homogeneity
    					option = { label: searchText };
    				} else {
    					if ([`number`, `undefined`].includes(typeof options[0]) && !isNaN(Number(searchText))) {
    						// create new option as number if it parses to a number and 1st option is also number or missing
    						option = Number(searchText);
    					} else {
    						option = searchText; // else create custom option as string
    					}

    					dispatch(`create`, { option });
    				}

    				if (allowUserOptions === `append`) $$invalidate(2, options = [...options, option]);
    			}

    			if (resetFilterOnAdd) $$invalidate(3, searchText = ``); // reset search string on selection

    			if ([``, undefined, null].includes(option)) {
    				console.error(`MultiSelect: encountered falsy option ${option}`);
    				return;
    			}

    			if (maxSelect === 1) {
    				// for maxSelect = 1 we always replace current option with new one
    				$$invalidate(4, selected = [option]);
    			} else {
    				$$invalidate(4, selected = [...selected, option]);

    				if (sortSelected === true) {
    					$$invalidate(4, selected = selected.sort((op1, op2) => {
    						const [label1, label2] = [get_label(op1), get_label(op2)];

    						// coerce to string if labels are numbers
    						return `${label1}`.localeCompare(`${label2}`);
    					}));
    				} else if (typeof sortSelected === `function`) {
    					$$invalidate(4, selected = selected.sort(sortSelected));
    				}
    			}

    			if (selected.length === maxSelect) close_dropdown(event); else if (focusInputOnSelect === true || focusInputOnSelect === `desktop` && window_width > breakpoint) {
    				input?.focus();
    			}

    			dispatch(`add`, { option });
    			dispatch(`change`, { option, type: `add` });
    			$$invalidate(7, invalid = false); // reset error status whenever new items are selected
    			form_input?.setCustomValidity(``);
    		}
    	}

    	// remove an option from selected list
    	function remove(to_remove) {
    		if (selected.length === 0) return;
    		const idx = selected.findIndex(opt => key(opt) === key(to_remove));
    		let [option] = selected.splice(idx, 1); // remove option from selected list

    		if (option === undefined && allowUserOptions) {
    			// if option with label could not be found but allowUserOptions is truthy,
    			// assume it was created by user and create corresponding option object
    			// on the fly for use as event payload
    			const other_ops_type = typeof options[0];

    			option = other_ops_type ? { label: to_remove } : to_remove;
    		}

    		if (option === undefined) {
    			return console.error(`Multiselect can't remove selected option ${JSON.stringify(to_remove)}, not found in selected list`);
    		}

    		$$invalidate(4, selected = [...selected]); // trigger Svelte rerender
    		$$invalidate(7, invalid = false); // reset error status whenever items are removed
    		form_input?.setCustomValidity(``);
    		dispatch(`remove`, { option });
    		dispatch(`change`, { option, type: `remove` });
    	}

    	function open_dropdown(event) {
    		if (disabled) return;
    		$$invalidate(8, open = true);

    		if (!(event instanceof FocusEvent)) {
    			// avoid double-focussing input when event that opened dropdown was already input FocusEvent
    			input?.focus();
    		}

    		dispatch(`open`, { event });
    	}

    	function close_dropdown(event) {
    		$$invalidate(8, open = false);
    		input?.blur();
    		$$invalidate(0, activeIndex = null);
    		dispatch(`close`, { event });
    	}

    	// handle all keyboard events this component receives
    	async function handle_keydown(event) {
    		// on escape or tab out of input: close options dropdown and reset search text
    		if (event.key === `Escape` || event.key === `Tab`) {
    			close_dropdown(event);
    			$$invalidate(3, searchText = ``);
    		} else // on enter key: toggle active option and reset search text
    		if (event.key === `Enter`) {
    			event.preventDefault(); // prevent enter key from triggering form submission

    			if (activeOption) {
    				selected.includes(activeOption)
    				? remove(activeOption)
    				: add(activeOption, event);

    				$$invalidate(3, searchText = ``);
    			} else if (allowUserOptions && searchText.length > 0) {
    				// user entered text but no options match, so if allowUserOptions is truthy, we create new option
    				add(searchText, event);
    			} else // no active option and no search text means the options dropdown is closed
    			// in which case enter means open it
    			open_dropdown(event);
    		} else // on up/down arrow keys: update active option
    		if ([`ArrowDown`, `ArrowUp`].includes(event.key)) {
    			// if no option is active yet, but there are matching options, make first one active
    			if (activeIndex === null && matchingOptions.length > 0) {
    				$$invalidate(0, activeIndex = 0);
    				return;
    			} else if (allowUserOptions && !matchingOptions.length && searchText.length > 0) {
    				// if allowUserOptions is truthy and user entered text but no options match, we make
    				// <li>{addUserMsg}</li> active on keydown (or toggle it if already active)
    				$$invalidate(44, option_msg_is_active = !option_msg_is_active);

    				return;
    			} else if (activeIndex === null) {
    				// if no option is active and no options are matching, do nothing
    				return;
    			}

    			event.preventDefault();

    			// if none of the above special cases apply, we make next/prev option
    			// active with wrap around at both ends
    			const increment = event.key === `ArrowUp` ? -1 : 1;

    			$$invalidate(0, activeIndex = (activeIndex + increment) % matchingOptions.length);

    			// in JS % behaves like remainder operator, not real modulo, so negative numbers stay negative
    			// need to do manual wrap around at 0
    			if (activeIndex < 0) $$invalidate(0, activeIndex = matchingOptions.length - 1);

    			if (autoScroll) {
    				await tick();
    				const li = document.querySelector(`ul.options > li.active`);
    				if (li) li.scrollIntoViewIfNeeded?.();
    			}
    		} else // on backspace key: remove last selected option
    		if (event.key === `Backspace` && selected.length > 0 && !searchText) {
    			remove(selected.at(-1));
    		} else // make first matching option active on any keypress (if none of the above special cases match)
    		if (matchingOptions.length > 0) {
    			$$invalidate(0, activeIndex = 0);
    		}
    	}

    	function remove_all() {
    		$$invalidate(4, selected = []);
    		$$invalidate(3, searchText = ``);
    		dispatch(`removeAll`, { options: selected });
    		dispatch(`change`, { options: selected, type: `removeAll` });
    	}

    	const if_enter_or_space = handler => event => {
    		if ([`Enter`, `Space`].includes(event.code)) {
    			event.preventDefault();
    			handler();
    		}
    	};

    	function on_click_outside(event) {
    		if (outerDiv && !outerDiv.contains(event.target)) {
    			close_dropdown(event);
    		}
    	}

    	let drag_idx = null;

    	// event handlers enable dragging to reorder selected options
    	const drop = target_idx => event => {
    		if (!event.dataTransfer) return;
    		event.dataTransfer.dropEffect = `move`;
    		const start_idx = parseInt(event.dataTransfer.getData(`text/plain`));
    		const new_selected = [...selected];

    		if (start_idx < target_idx) {
    			new_selected.splice(target_idx + 1, 0, new_selected[start_idx]);
    			new_selected.splice(start_idx, 1);
    		} else {
    			new_selected.splice(target_idx, 0, new_selected[start_idx]);
    			new_selected.splice(start_idx + 1, 1);
    		}

    		$$invalidate(4, selected = new_selected);
    		$$invalidate(46, drag_idx = null);
    	};

    	const dragstart = idx => event => {
    		if (!event.dataTransfer) return;

    		// only allow moving, not copying (also affects the cursor during drag)
    		event.dataTransfer.effectAllowed = `move`;

    		event.dataTransfer.dropEffect = `move`;
    		event.dataTransfer.setData(`text/plain`, `${idx}`);
    	};

    	let ul_options;

    	// highlight text matching user-entered search text in available options
    	function highlight_matching_options(event) {
    		if (!highlightMatches || typeof CSS == `undefined` || !CSS.highlights) return; // don't try if CSS highlight API not supported

    		// clear previous ranges from HighlightRegistry
    		CSS.highlights.clear();

    		// get input's search query
    		const query = event?.target?.value.trim().toLowerCase();

    		if (!query) return;

    		const tree_walker = document.createTreeWalker(ul_options, NodeFilter.SHOW_TEXT, {
    			acceptNode: node => {
    				// don't highlight text in the "no matching options" message
    				if (node?.textContent === noMatchingOptionsMsg) return NodeFilter.FILTER_REJECT;

    				return NodeFilter.FILTER_ACCEPT;
    			}
    		});

    		const text_nodes = [];
    		let current_node = tree_walker.nextNode();

    		while (current_node) {
    			text_nodes.push(current_node);
    			current_node = tree_walker.nextNode();
    		}

    		// iterate over all text nodes and find matches
    		const ranges = text_nodes.map(el => {
    			const text = el.textContent?.toLowerCase();
    			const indices = [];
    			let start_pos = 0;

    			while (text && start_pos < text.length) {
    				const index = text.indexOf(query, start_pos);
    				if (index === -1) break;
    				indices.push(index);
    				start_pos = index + query.length;
    			}

    			// create range object for each str found in the text node
    			return indices.map(index => {
    				const range = new Range();
    				range.setStart(el, index);
    				range.setEnd(el, index + query.length);
    				return range;
    			});
    		});

    		// create Highlight object from ranges and add to registry
    		// eslint-disable-next-line no-undef
    		CSS.highlights.set(`sms-search-matches`, new Highlight(...ranges.flat()));
    	}

    	$$self.$$.on_mount.push(function () {
    		if (options === undefined && !('options' in $$props || $$self.$$.bound[$$self.$$.props['options']])) {
    			console_1$1.warn("<MultiSelect> was created without expected prop 'options'");
    		}
    	});

    	const writable_props = [
    		'activeIndex',
    		'activeOption',
    		'createOptionMsg',
    		'allowUserOptions',
    		'allowEmpty',
    		'autocomplete',
    		'autoScroll',
    		'breakpoint',
    		'defaultDisabledTitle',
    		'disabled',
    		'disabledInputTitle',
    		'duplicateOptionMsg',
    		'duplicates',
    		'key',
    		'filterFunc',
    		'focusInputOnSelect',
    		'form_input',
    		'highlightMatches',
    		'id',
    		'input',
    		'inputClass',
    		'inputmode',
    		'invalid',
    		'liActiveOptionClass',
    		'liOptionClass',
    		'liSelectedClass',
    		'loading',
    		'matchingOptions',
    		'maxOptions',
    		'maxSelect',
    		'maxSelectMsg',
    		'maxSelectMsgClass',
    		'name',
    		'noMatchingOptionsMsg',
    		'open',
    		'options',
    		'outerDiv',
    		'outerDivClass',
    		'parseLabelsAsHtml',
    		'pattern',
    		'placeholder',
    		'removeAllTitle',
    		'removeBtnTitle',
    		'minSelect',
    		'required',
    		'resetFilterOnAdd',
    		'searchText',
    		'selected',
    		'sortSelected',
    		'selectedOptionsDraggable',
    		'ulOptionsClass',
    		'ulSelectedClass',
    		'value'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MultiSelect> was created with unknown prop '${key}'`);
    	});

    	function mousedown_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mousedown_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchcancel_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchmove_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function onwindowresize() {
    		$$invalidate(45, window_width = window.innerWidth);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			form_input = $$value;
    			$$invalidate(5, form_input);
    		});
    	}

    	const invalid_handler = () => {
    		$$invalidate(7, invalid = true);
    		let msg;

    		if (maxSelect && maxSelect > 1 && Number(required) > 1) {
    			msg = `Please select between ${required} and ${maxSelect} options`;
    		} else if (Number(required) > 1) {
    			msg = `Please select at least ${required} options`;
    		} else {
    			msg = `Please select an option`;
    		}

    		form_input?.setCustomValidity(msg);
    	};

    	const mouseup_handler = option => remove(option);
    	const keydown_handler_1 = option => remove(option);
    	const dragenter_handler = idx => $$invalidate(46, drag_idx = idx);

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(6, input);
    		});
    	}

    	function input1_input_handler() {
    		searchText = this.value;
    		$$invalidate(3, searchText);
    	}

    	function wiggle_1_wiggle_binding(value) {
    		wiggle = value;
    		$$invalidate(43, wiggle);
    	}

    	const mouseup_handler_1 = (disabled, option, event) => {
    		if (!disabled) add(option, event);
    	};

    	const mouseover_handler = (disabled, idx) => {
    		if (!disabled) $$invalidate(0, activeIndex = idx);
    	};

    	const focus_handler_1 = (disabled, idx) => {
    		if (!disabled) $$invalidate(0, activeIndex = idx);
    	};

    	const mouseout_handler = () => $$invalidate(0, activeIndex = null);
    	const blur_handler_1 = () => $$invalidate(0, activeIndex = null);

    	const mouseup_handler_2 = event => {
    		if (allowUserOptions) add(searchText, event);
    	};

    	const mouseover_handler_1 = () => $$invalidate(44, option_msg_is_active = true);
    	const focus_handler_2 = () => $$invalidate(44, option_msg_is_active = true);
    	const mouseout_handler_1 = () => $$invalidate(44, option_msg_is_active = false);
    	const blur_handler_2 = () => $$invalidate(44, option_msg_is_active = false);

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ul_options = $$value;
    			$$invalidate(47, ul_options);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			outerDiv = $$value;
    			$$invalidate(9, outerDiv);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('activeIndex' in $$props) $$invalidate(0, activeIndex = $$props.activeIndex);
    		if ('activeOption' in $$props) $$invalidate(60, activeOption = $$props.activeOption);
    		if ('createOptionMsg' in $$props) $$invalidate(10, createOptionMsg = $$props.createOptionMsg);
    		if ('allowUserOptions' in $$props) $$invalidate(11, allowUserOptions = $$props.allowUserOptions);
    		if ('allowEmpty' in $$props) $$invalidate(61, allowEmpty = $$props.allowEmpty);
    		if ('autocomplete' in $$props) $$invalidate(12, autocomplete = $$props.autocomplete);
    		if ('autoScroll' in $$props) $$invalidate(62, autoScroll = $$props.autoScroll);
    		if ('breakpoint' in $$props) $$invalidate(63, breakpoint = $$props.breakpoint);
    		if ('defaultDisabledTitle' in $$props) $$invalidate(13, defaultDisabledTitle = $$props.defaultDisabledTitle);
    		if ('disabled' in $$props) $$invalidate(42, disabled = $$props.disabled);
    		if ('disabledInputTitle' in $$props) $$invalidate(14, disabledInputTitle = $$props.disabledInputTitle);
    		if ('duplicateOptionMsg' in $$props) $$invalidate(15, duplicateOptionMsg = $$props.duplicateOptionMsg);
    		if ('duplicates' in $$props) $$invalidate(16, duplicates = $$props.duplicates);
    		if ('key' in $$props) $$invalidate(17, key = $$props.key);
    		if ('filterFunc' in $$props) $$invalidate(64, filterFunc = $$props.filterFunc);
    		if ('focusInputOnSelect' in $$props) $$invalidate(65, focusInputOnSelect = $$props.focusInputOnSelect);
    		if ('form_input' in $$props) $$invalidate(5, form_input = $$props.form_input);
    		if ('highlightMatches' in $$props) $$invalidate(66, highlightMatches = $$props.highlightMatches);
    		if ('id' in $$props) $$invalidate(18, id = $$props.id);
    		if ('input' in $$props) $$invalidate(6, input = $$props.input);
    		if ('inputClass' in $$props) $$invalidate(19, inputClass = $$props.inputClass);
    		if ('inputmode' in $$props) $$invalidate(20, inputmode = $$props.inputmode);
    		if ('invalid' in $$props) $$invalidate(7, invalid = $$props.invalid);
    		if ('liActiveOptionClass' in $$props) $$invalidate(21, liActiveOptionClass = $$props.liActiveOptionClass);
    		if ('liOptionClass' in $$props) $$invalidate(22, liOptionClass = $$props.liOptionClass);
    		if ('liSelectedClass' in $$props) $$invalidate(23, liSelectedClass = $$props.liSelectedClass);
    		if ('loading' in $$props) $$invalidate(24, loading = $$props.loading);
    		if ('matchingOptions' in $$props) $$invalidate(1, matchingOptions = $$props.matchingOptions);
    		if ('maxOptions' in $$props) $$invalidate(25, maxOptions = $$props.maxOptions);
    		if ('maxSelect' in $$props) $$invalidate(26, maxSelect = $$props.maxSelect);
    		if ('maxSelectMsg' in $$props) $$invalidate(27, maxSelectMsg = $$props.maxSelectMsg);
    		if ('maxSelectMsgClass' in $$props) $$invalidate(28, maxSelectMsgClass = $$props.maxSelectMsgClass);
    		if ('name' in $$props) $$invalidate(29, name = $$props.name);
    		if ('noMatchingOptionsMsg' in $$props) $$invalidate(30, noMatchingOptionsMsg = $$props.noMatchingOptionsMsg);
    		if ('open' in $$props) $$invalidate(8, open = $$props.open);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('outerDiv' in $$props) $$invalidate(9, outerDiv = $$props.outerDiv);
    		if ('outerDivClass' in $$props) $$invalidate(31, outerDivClass = $$props.outerDivClass);
    		if ('parseLabelsAsHtml' in $$props) $$invalidate(32, parseLabelsAsHtml = $$props.parseLabelsAsHtml);
    		if ('pattern' in $$props) $$invalidate(33, pattern = $$props.pattern);
    		if ('placeholder' in $$props) $$invalidate(34, placeholder = $$props.placeholder);
    		if ('removeAllTitle' in $$props) $$invalidate(35, removeAllTitle = $$props.removeAllTitle);
    		if ('removeBtnTitle' in $$props) $$invalidate(36, removeBtnTitle = $$props.removeBtnTitle);
    		if ('minSelect' in $$props) $$invalidate(37, minSelect = $$props.minSelect);
    		if ('required' in $$props) $$invalidate(38, required = $$props.required);
    		if ('resetFilterOnAdd' in $$props) $$invalidate(67, resetFilterOnAdd = $$props.resetFilterOnAdd);
    		if ('searchText' in $$props) $$invalidate(3, searchText = $$props.searchText);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('sortSelected' in $$props) $$invalidate(68, sortSelected = $$props.sortSelected);
    		if ('selectedOptionsDraggable' in $$props) $$invalidate(39, selectedOptionsDraggable = $$props.selectedOptionsDraggable);
    		if ('ulOptionsClass' in $$props) $$invalidate(40, ulOptionsClass = $$props.ulOptionsClass);
    		if ('ulSelectedClass' in $$props) $$invalidate(41, ulSelectedClass = $$props.ulSelectedClass);
    		if ('value' in $$props) $$invalidate(59, value = $$props.value);
    		if ('$$scope' in $$props) $$invalidate(107, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		tick,
    		flip,
    		CircleSpinner,
    		Wiggle,
    		CrossIcon: Cross,
    		DisabledIcon: Disabled,
    		ExpandIcon: ChevronExpand,
    		get_label,
    		get_style,
    		activeIndex,
    		activeOption,
    		createOptionMsg,
    		allowUserOptions,
    		allowEmpty,
    		autocomplete,
    		autoScroll,
    		breakpoint,
    		defaultDisabledTitle,
    		disabled,
    		disabledInputTitle,
    		duplicateOptionMsg,
    		duplicates,
    		key,
    		filterFunc,
    		focusInputOnSelect,
    		form_input,
    		highlightMatches,
    		id,
    		input,
    		inputClass,
    		inputmode,
    		invalid,
    		liActiveOptionClass,
    		liOptionClass,
    		liSelectedClass,
    		loading,
    		matchingOptions,
    		maxOptions,
    		maxSelect,
    		maxSelectMsg,
    		maxSelectMsgClass,
    		name,
    		noMatchingOptionsMsg,
    		open,
    		options,
    		outerDiv,
    		outerDivClass,
    		parseLabelsAsHtml,
    		pattern,
    		placeholder,
    		removeAllTitle,
    		removeBtnTitle,
    		minSelect,
    		required,
    		resetFilterOnAdd,
    		searchText,
    		selected,
    		sortSelected,
    		selectedOptionsDraggable,
    		ulOptionsClass,
    		ulSelectedClass,
    		value,
    		selected_to_value,
    		value_to_selected,
    		wiggle,
    		dispatch,
    		option_msg_is_active,
    		window_width,
    		add,
    		remove,
    		open_dropdown,
    		close_dropdown,
    		handle_keydown,
    		remove_all,
    		if_enter_or_space,
    		on_click_outside,
    		drag_idx,
    		drop,
    		dragstart,
    		ul_options,
    		highlight_matching_options,
    		is_selected
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeIndex' in $$props) $$invalidate(0, activeIndex = $$props.activeIndex);
    		if ('activeOption' in $$props) $$invalidate(60, activeOption = $$props.activeOption);
    		if ('createOptionMsg' in $$props) $$invalidate(10, createOptionMsg = $$props.createOptionMsg);
    		if ('allowUserOptions' in $$props) $$invalidate(11, allowUserOptions = $$props.allowUserOptions);
    		if ('allowEmpty' in $$props) $$invalidate(61, allowEmpty = $$props.allowEmpty);
    		if ('autocomplete' in $$props) $$invalidate(12, autocomplete = $$props.autocomplete);
    		if ('autoScroll' in $$props) $$invalidate(62, autoScroll = $$props.autoScroll);
    		if ('breakpoint' in $$props) $$invalidate(63, breakpoint = $$props.breakpoint);
    		if ('defaultDisabledTitle' in $$props) $$invalidate(13, defaultDisabledTitle = $$props.defaultDisabledTitle);
    		if ('disabled' in $$props) $$invalidate(42, disabled = $$props.disabled);
    		if ('disabledInputTitle' in $$props) $$invalidate(14, disabledInputTitle = $$props.disabledInputTitle);
    		if ('duplicateOptionMsg' in $$props) $$invalidate(15, duplicateOptionMsg = $$props.duplicateOptionMsg);
    		if ('duplicates' in $$props) $$invalidate(16, duplicates = $$props.duplicates);
    		if ('key' in $$props) $$invalidate(17, key = $$props.key);
    		if ('filterFunc' in $$props) $$invalidate(64, filterFunc = $$props.filterFunc);
    		if ('focusInputOnSelect' in $$props) $$invalidate(65, focusInputOnSelect = $$props.focusInputOnSelect);
    		if ('form_input' in $$props) $$invalidate(5, form_input = $$props.form_input);
    		if ('highlightMatches' in $$props) $$invalidate(66, highlightMatches = $$props.highlightMatches);
    		if ('id' in $$props) $$invalidate(18, id = $$props.id);
    		if ('input' in $$props) $$invalidate(6, input = $$props.input);
    		if ('inputClass' in $$props) $$invalidate(19, inputClass = $$props.inputClass);
    		if ('inputmode' in $$props) $$invalidate(20, inputmode = $$props.inputmode);
    		if ('invalid' in $$props) $$invalidate(7, invalid = $$props.invalid);
    		if ('liActiveOptionClass' in $$props) $$invalidate(21, liActiveOptionClass = $$props.liActiveOptionClass);
    		if ('liOptionClass' in $$props) $$invalidate(22, liOptionClass = $$props.liOptionClass);
    		if ('liSelectedClass' in $$props) $$invalidate(23, liSelectedClass = $$props.liSelectedClass);
    		if ('loading' in $$props) $$invalidate(24, loading = $$props.loading);
    		if ('matchingOptions' in $$props) $$invalidate(1, matchingOptions = $$props.matchingOptions);
    		if ('maxOptions' in $$props) $$invalidate(25, maxOptions = $$props.maxOptions);
    		if ('maxSelect' in $$props) $$invalidate(26, maxSelect = $$props.maxSelect);
    		if ('maxSelectMsg' in $$props) $$invalidate(27, maxSelectMsg = $$props.maxSelectMsg);
    		if ('maxSelectMsgClass' in $$props) $$invalidate(28, maxSelectMsgClass = $$props.maxSelectMsgClass);
    		if ('name' in $$props) $$invalidate(29, name = $$props.name);
    		if ('noMatchingOptionsMsg' in $$props) $$invalidate(30, noMatchingOptionsMsg = $$props.noMatchingOptionsMsg);
    		if ('open' in $$props) $$invalidate(8, open = $$props.open);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('outerDiv' in $$props) $$invalidate(9, outerDiv = $$props.outerDiv);
    		if ('outerDivClass' in $$props) $$invalidate(31, outerDivClass = $$props.outerDivClass);
    		if ('parseLabelsAsHtml' in $$props) $$invalidate(32, parseLabelsAsHtml = $$props.parseLabelsAsHtml);
    		if ('pattern' in $$props) $$invalidate(33, pattern = $$props.pattern);
    		if ('placeholder' in $$props) $$invalidate(34, placeholder = $$props.placeholder);
    		if ('removeAllTitle' in $$props) $$invalidate(35, removeAllTitle = $$props.removeAllTitle);
    		if ('removeBtnTitle' in $$props) $$invalidate(36, removeBtnTitle = $$props.removeBtnTitle);
    		if ('minSelect' in $$props) $$invalidate(37, minSelect = $$props.minSelect);
    		if ('required' in $$props) $$invalidate(38, required = $$props.required);
    		if ('resetFilterOnAdd' in $$props) $$invalidate(67, resetFilterOnAdd = $$props.resetFilterOnAdd);
    		if ('searchText' in $$props) $$invalidate(3, searchText = $$props.searchText);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('sortSelected' in $$props) $$invalidate(68, sortSelected = $$props.sortSelected);
    		if ('selectedOptionsDraggable' in $$props) $$invalidate(39, selectedOptionsDraggable = $$props.selectedOptionsDraggable);
    		if ('ulOptionsClass' in $$props) $$invalidate(40, ulOptionsClass = $$props.ulOptionsClass);
    		if ('ulSelectedClass' in $$props) $$invalidate(41, ulSelectedClass = $$props.ulSelectedClass);
    		if ('value' in $$props) $$invalidate(59, value = $$props.value);
    		if ('wiggle' in $$props) $$invalidate(43, wiggle = $$props.wiggle);
    		if ('option_msg_is_active' in $$props) $$invalidate(44, option_msg_is_active = $$props.option_msg_is_active);
    		if ('window_width' in $$props) $$invalidate(45, window_width = $$props.window_width);
    		if ('drag_idx' in $$props) $$invalidate(46, drag_idx = $$props.drag_idx);
    		if ('ul_options' in $$props) $$invalidate(47, ul_options = $$props.ul_options);
    		if ('is_selected' in $$props) $$invalidate(48, is_selected = $$props.is_selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selected*/ 16) {
    			// if maxSelect=1, value is the single item in selected (or null if selected is empty)
    			// this solves both https://github.com/janosh/svelte-multiselect/issues/86 and
    			// https://github.com/janosh/svelte-multiselect/issues/136
    			selected_to_value(selected);
    		}

    		if ($$self.$$.dirty[1] & /*value*/ 268435456) {
    			value_to_selected(value);
    		}

    		if ($$self.$$.dirty[0] & /*options, searchText, selected, key, duplicates*/ 196636 | $$self.$$.dirty[2] & /*filterFunc*/ 4) {
    			// options matching the current search text
    			$$invalidate(1, matchingOptions = options.filter(opt => filterFunc(opt, searchText) && (// remove already selected options from dropdown list unless duplicate selections are allowed
    			!selected.map(key).includes(key(opt)) || duplicates)));
    		}

    		if ($$self.$$.dirty[0] & /*matchingOptions, activeIndex*/ 3) {
    			// update activeOption when activeIndex changes
    			$$invalidate(60, activeOption = matchingOptions[activeIndex ?? -1] ?? null);
    		}

    		if ($$self.$$.dirty[0] & /*selected*/ 16) {
    			$$invalidate(48, is_selected = label => selected.map(get_label).includes(label));
    		}
    	};

    	return [
    		activeIndex,
    		matchingOptions,
    		options,
    		searchText,
    		selected,
    		form_input,
    		input,
    		invalid,
    		open,
    		outerDiv,
    		createOptionMsg,
    		allowUserOptions,
    		autocomplete,
    		defaultDisabledTitle,
    		disabledInputTitle,
    		duplicateOptionMsg,
    		duplicates,
    		key,
    		id,
    		inputClass,
    		inputmode,
    		liActiveOptionClass,
    		liOptionClass,
    		liSelectedClass,
    		loading,
    		maxOptions,
    		maxSelect,
    		maxSelectMsg,
    		maxSelectMsgClass,
    		name,
    		noMatchingOptionsMsg,
    		outerDivClass,
    		parseLabelsAsHtml,
    		pattern,
    		placeholder,
    		removeAllTitle,
    		removeBtnTitle,
    		minSelect,
    		required,
    		selectedOptionsDraggable,
    		ulOptionsClass,
    		ulSelectedClass,
    		disabled,
    		wiggle,
    		option_msg_is_active,
    		window_width,
    		drag_idx,
    		ul_options,
    		is_selected,
    		add,
    		remove,
    		open_dropdown,
    		handle_keydown,
    		remove_all,
    		if_enter_or_space,
    		on_click_outside,
    		drop,
    		dragstart,
    		highlight_matching_options,
    		value,
    		activeOption,
    		allowEmpty,
    		autoScroll,
    		breakpoint,
    		filterFunc,
    		focusInputOnSelect,
    		highlightMatches,
    		resetFilterOnAdd,
    		sortSelected,
    		slots,
    		mousedown_handler_2,
    		mousedown_handler_1,
    		focus_handler,
    		blur_handler,
    		change_handler,
    		click_handler,
    		keydown_handler,
    		keyup_handler,
    		mousedown_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		touchcancel_handler,
    		touchend_handler,
    		touchmove_handler,
    		touchstart_handler,
    		dragover_handler,
    		onwindowresize,
    		input0_binding,
    		invalid_handler,
    		mouseup_handler,
    		keydown_handler_1,
    		dragenter_handler,
    		input1_binding,
    		input1_input_handler,
    		wiggle_1_wiggle_binding,
    		mouseup_handler_1,
    		mouseover_handler,
    		focus_handler_1,
    		mouseout_handler,
    		blur_handler_1,
    		mouseup_handler_2,
    		mouseover_handler_1,
    		focus_handler_2,
    		mouseout_handler_1,
    		blur_handler_2,
    		ul_binding,
    		div_binding,
    		$$scope
    	];
    }

    class MultiSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				activeIndex: 0,
    				activeOption: 60,
    				createOptionMsg: 10,
    				allowUserOptions: 11,
    				allowEmpty: 61,
    				autocomplete: 12,
    				autoScroll: 62,
    				breakpoint: 63,
    				defaultDisabledTitle: 13,
    				disabled: 42,
    				disabledInputTitle: 14,
    				duplicateOptionMsg: 15,
    				duplicates: 16,
    				key: 17,
    				filterFunc: 64,
    				focusInputOnSelect: 65,
    				form_input: 5,
    				highlightMatches: 66,
    				id: 18,
    				input: 6,
    				inputClass: 19,
    				inputmode: 20,
    				invalid: 7,
    				liActiveOptionClass: 21,
    				liOptionClass: 22,
    				liSelectedClass: 23,
    				loading: 24,
    				matchingOptions: 1,
    				maxOptions: 25,
    				maxSelect: 26,
    				maxSelectMsg: 27,
    				maxSelectMsgClass: 28,
    				name: 29,
    				noMatchingOptionsMsg: 30,
    				open: 8,
    				options: 2,
    				outerDiv: 9,
    				outerDivClass: 31,
    				parseLabelsAsHtml: 32,
    				pattern: 33,
    				placeholder: 34,
    				removeAllTitle: 35,
    				removeBtnTitle: 36,
    				minSelect: 37,
    				required: 38,
    				resetFilterOnAdd: 67,
    				searchText: 3,
    				selected: 4,
    				sortSelected: 68,
    				selectedOptionsDraggable: 39,
    				ulOptionsClass: 40,
    				ulSelectedClass: 41,
    				value: 59
    			},
    			null,
    			[-1, -1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelect",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get activeIndex() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeIndex(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeOption() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeOption(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createOptionMsg() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createOptionMsg(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowUserOptions() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowUserOptions(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowEmpty() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowEmpty(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoScroll() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoScroll(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get breakpoint() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set breakpoint(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultDisabledTitle() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultDisabledTitle(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledInputTitle() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledInputTitle(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duplicateOptionMsg() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duplicateOptionMsg(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duplicates() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duplicates(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterFunc() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterFunc(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusInputOnSelect() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusInputOnSelect(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get form_input() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set form_input(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlightMatches() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlightMatches(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputmode() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputmode(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get liActiveOptionClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set liActiveOptionClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get liOptionClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set liOptionClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get liSelectedClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set liSelectedClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get matchingOptions() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matchingOptions(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxOptions() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxOptions(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSelect() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSelect(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSelectMsg() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSelectMsg(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSelectMsgClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSelectMsgClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noMatchingOptionsMsg() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noMatchingOptionsMsg(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerDiv() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerDiv(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerDivClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerDivClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parseLabelsAsHtml() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parseLabelsAsHtml(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pattern() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pattern(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get removeAllTitle() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set removeAllTitle(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get removeBtnTitle() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set removeBtnTitle(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minSelect() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minSelect(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetFilterOnAdd() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resetFilterOnAdd(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchText() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchText(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortSelected() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortSelected(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedOptionsDraggable() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedOptionsDraggable(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ulOptionsClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ulOptionsClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ulSelectedClass() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ulSelectedClass(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Firefox lacks support for scrollIntoViewIfNeeded (https://caniuse.com/scrollintoviewifneeded).
    // See https://github.com/janosh/svelte-multiselect/issues/87
    // Polyfill copied from
    // https://github.com/nuxodin/lazyfill/blob/a8e63/polyfills/Element/prototype/scrollIntoViewIfNeeded.js
    // exported for testing
    function scroll_into_view_if_needed_polyfill(centerIfNeeded = true) {
        const elem = this;
        const observer = new IntersectionObserver(function ([entry]) {
            const ratio = entry.intersectionRatio;
            if (ratio < 1) {
                const place = ratio <= 0 && centerIfNeeded ? `center` : `nearest`;
                elem.scrollIntoView({
                    block: place,
                    inline: place,
                });
            }
            this.disconnect();
        });
        observer.observe(elem);
        return observer; // return for testing
    }
    if (typeof Element !== `undefined` &&
        !Element.prototype?.scrollIntoViewIfNeeded &&
        typeof IntersectionObserver !== `undefined`) {
        Element.prototype.scrollIntoViewIfNeeded = scroll_into_view_if_needed_polyfill;
    }

    var connections = [
    	{
    		station1: "11",
    		station2: "163",
    		line: "1",
    		time: "1"
    	},
    	{
    		station1: "11",
    		station2: "212",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "49",
    		station2: "87",
    		line: "1",
    		time: "1"
    	},
    	{
    		station1: "49",
    		station2: "197",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "82",
    		station2: "163",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "82",
    		station2: "193",
    		line: "1",
    		time: "3"
    	},
    	{
    		station1: "84",
    		station2: "148",
    		line: "1",
    		time: "3"
    	},
    	{
    		station1: "87",
    		station2: "279",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "113",
    		station2: "246",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "113",
    		station2: "298",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "114",
    		station2: "140",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "137",
    		station2: "206",
    		line: "1",
    		time: "3"
    	},
    	{
    		station1: "137",
    		station2: "298",
    		line: "1",
    		time: "3"
    	},
    	{
    		station1: "140",
    		station2: "237",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "143",
    		station2: "159",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "143",
    		station2: "206",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "148",
    		station2: "279",
    		line: "1",
    		time: "1"
    	},
    	{
    		station1: "159",
    		station2: "278",
    		line: "1",
    		time: "1"
    	},
    	{
    		station1: "185",
    		station2: "237",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "185",
    		station2: "281",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "192",
    		station2: "197",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "192",
    		station2: "212",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "193",
    		station2: "278",
    		line: "1",
    		time: "2"
    	},
    	{
    		station1: "246",
    		station2: "281",
    		line: "1",
    		time: "3"
    	},
    	{
    		station1: "13",
    		station2: "156",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "13",
    		station2: "250",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "16",
    		station2: "91",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "16",
    		station2: "173",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "24",
    		station2: "156",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "24",
    		station2: "164",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "28",
    		station2: "162",
    		line: "2",
    		time: "1"
    	},
    	{
    		station1: "28",
    		station2: "192",
    		line: "2",
    		time: "1"
    	},
    	{
    		station1: "37",
    		station2: "158",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "37",
    		station2: "301",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "48",
    		station2: "126",
    		line: "2",
    		time: "1"
    	},
    	{
    		station1: "48",
    		station2: "250",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "51",
    		station2: "103",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "51",
    		station2: "215",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "68",
    		station2: "158",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "68",
    		station2: "256",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "72",
    		station2: "286",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "76",
    		station2: "181",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "76",
    		station2: "296",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "88",
    		station2: "256",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "91",
    		station2: "109",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "98",
    		station2: "173",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "98",
    		station2: "211",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "103",
    		station2: "109",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "105",
    		station2: "177",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "105",
    		station2: "196",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "112",
    		station2: "181",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "112",
    		station2: "196",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "126",
    		station2: "259",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "127",
    		station2: "186",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "127",
    		station2: "226",
    		line: "2",
    		time: "1"
    	},
    	{
    		station1: "149",
    		station2: "162",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "149",
    		station2: "208",
    		line: "2",
    		time: "1"
    	},
    	{
    		station1: "153",
    		station2: "154",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "153",
    		station2: "247",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "154",
    		station2: "230",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "154",
    		station2: "275",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "164",
    		station2: "247",
    		line: "2",
    		time: "4"
    	},
    	{
    		station1: "177",
    		station2: "239",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "181",
    		station2: "286",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "186",
    		station2: "208",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "192",
    		station2: "259",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "211",
    		station2: "275",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "215",
    		station2: "301",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "221",
    		station2: "239",
    		line: "2",
    		time: "1"
    	},
    	{
    		station1: "221",
    		station2: "294",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "226",
    		station2: "296",
    		line: "2",
    		time: "3"
    	},
    	{
    		station1: "230",
    		station2: "241",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "241",
    		station2: "301",
    		line: "2",
    		time: "2"
    	},
    	{
    		station1: "2",
    		station2: "156",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "2",
    		station2: "263",
    		line: "3",
    		time: "4"
    	},
    	{
    		station1: "11",
    		station2: "83",
    		line: "3",
    		time: "3"
    	},
    	{
    		station1: "11",
    		station2: "104",
    		line: "3",
    		time: "3"
    	},
    	{
    		station1: "14",
    		station2: "92",
    		line: "3",
    		time: "1"
    	},
    	{
    		station1: "14",
    		station2: "167",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "18",
    		station2: "186",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "18",
    		station2: "193",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "25",
    		station2: "161",
    		line: "3",
    		time: "1"
    	},
    	{
    		station1: "25",
    		station2: "255",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "44",
    		station2: "161",
    		line: "3",
    		time: "1"
    	},
    	{
    		station1: "44",
    		station2: "166",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "83",
    		station2: "193",
    		line: "3",
    		time: "3"
    	},
    	{
    		station1: "87",
    		station2: "255",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "87",
    		station2: "285",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "90",
    		station2: "104",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "90",
    		station2: "145",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "92",
    		station2: "145",
    		line: "3",
    		time: "4"
    	},
    	{
    		station1: "99",
    		station2: "122",
    		line: "3",
    		time: "4"
    	},
    	{
    		station1: "99",
    		station2: "236",
    		line: "3",
    		time: "1"
    	},
    	{
    		station1: "122",
    		station2: "186",
    		line: "3",
    		time: "3"
    	},
    	{
    		station1: "156",
    		station2: "167",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "166",
    		station2: "263",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "229",
    		station2: "236",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "229",
    		station2: "273",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "248",
    		station2: "273",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "248",
    		station2: "285",
    		line: "3",
    		time: "2"
    	},
    	{
    		station1: "3",
    		station2: "263",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "3",
    		station2: "295",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "15",
    		station2: "78",
    		line: "4",
    		time: "4"
    	},
    	{
    		station1: "15",
    		station2: "269",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "17",
    		station2: "110",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "17",
    		station2: "293",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "18",
    		station2: "186",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "18",
    		station2: "193",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "21",
    		station2: "67",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "21",
    		station2: "269",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "25",
    		station2: "161",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "25",
    		station2: "255",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "33",
    		station2: "36",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "33",
    		station2: "164",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "36",
    		station2: "289",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "44",
    		station2: "161",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "44",
    		station2: "166",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "52",
    		station2: "1",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "52",
    		station2: "265",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "66",
    		station2: "67",
    		line: "4",
    		time: "4"
    	},
    	{
    		station1: "66",
    		station2: "85",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "72",
    		station2: "73",
    		line: "4",
    		time: "4"
    	},
    	{
    		station1: "73",
    		station2: "1",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "74",
    		station2: "99",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "74",
    		station2: "122",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "74",
    		station2: "138",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "74",
    		station2: "287",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "74",
    		station2: "293",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "78",
    		station2: "270",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "80",
    		station2: "205",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "80",
    		station2: "231",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "83",
    		station2: "193",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "85",
    		station2: "129",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "87",
    		station2: "255",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "87",
    		station2: "285",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "96",
    		station2: "195",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "96",
    		station2: "287",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "99",
    		station2: "236",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "108",
    		station2: "141",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "108",
    		station2: "265",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "110",
    		station2: "209",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "122",
    		station2: "186",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "129",
    		station2: "268",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "141",
    		station2: "213",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "164",
    		station2: "244",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "166",
    		station2: "263",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "195",
    		station2: "205",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "200",
    		station2: "270",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "200",
    		station2: "289",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "209",
    		station2: "242",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "229",
    		station2: "236",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "229",
    		station2: "273",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "231",
    		station2: "300",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "242",
    		station2: "265",
    		line: "4",
    		time: "1"
    	},
    	{
    		station1: "244",
    		station2: "295",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "248",
    		station2: "273",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "248",
    		station2: "285",
    		line: "4",
    		time: "2"
    	},
    	{
    		station1: "267",
    		station2: "268",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "299",
    		station2: "300",
    		line: "4",
    		time: "3"
    	},
    	{
    		station1: "4",
    		station2: "70",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "4",
    		station2: "201",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "13",
    		station2: "225",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "19",
    		station2: "97",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "20",
    		station2: "65",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "20",
    		station2: "217",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "27",
    		station2: "79",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "27",
    		station2: "201",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "32",
    		station2: "70",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "32",
    		station2: "204",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "42",
    		station2: "120",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "42",
    		station2: "292",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "43",
    		station2: "79",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "43",
    		station2: "219",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "61",
    		station2: "171",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "61",
    		station2: "238",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "63",
    		station2: "203",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "63",
    		station2: "219",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "64",
    		station2: "106",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "64",
    		station2: "135",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "65",
    		station2: "97",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "69",
    		station2: "86",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "69",
    		station2: "106",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "86",
    		station2: "152",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "120",
    		station2: "238",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "135",
    		station2: "171",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "155",
    		station2: "225",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "155",
    		station2: "284",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "201",
    		station2: "284",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "201",
    		station2: "292",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "203",
    		station2: "217",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "204",
    		station2: "247",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "225",
    		station2: "262",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "284",
    		station2: "292",
    		line: "13",
    		time: "2"
    	},
    	{
    		station1: "41",
    		station2: "216",
    		line: "5",
    		time: "1"
    	},
    	{
    		station1: "41",
    		station2: "253",
    		line: "5",
    		time: "2"
    	},
    	{
    		station1: "174",
    		station2: "253",
    		line: "5",
    		time: "4"
    	},
    	{
    		station1: "175",
    		station2: "253",
    		line: "5",
    		time: "4"
    	},
    	{
    		station1: "216",
    		station2: "276",
    		line: "5",
    		time: "1"
    	},
    	{
    		station1: "225",
    		station2: "276",
    		line: "5",
    		time: "1"
    	},
    	{
    		station1: "225",
    		station2: "295",
    		line: "5",
    		time: "2"
    	},
    	{
    		station1: "228",
    		station2: "295",
    		line: "5",
    		time: "2"
    	},
    	{
    		station1: "3",
    		station2: "156",
    		line: "6",
    		time: "4"
    	},
    	{
    		station1: "3",
    		station2: "295",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "11",
    		station2: "83",
    		line: "6",
    		time: "3"
    	},
    	{
    		station1: "11",
    		station2: "104",
    		line: "6",
    		time: "3"
    	},
    	{
    		station1: "14",
    		station2: "92",
    		line: "6",
    		time: "1"
    	},
    	{
    		station1: "14",
    		station2: "167",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "15",
    		station2: "78",
    		line: "6",
    		time: "4"
    	},
    	{
    		station1: "33",
    		station2: "36",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "33",
    		station2: "164",
    		line: "6",
    		time: "1"
    	},
    	{
    		station1: "36",
    		station2: "289",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "78",
    		station2: "270",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "83",
    		station2: "193",
    		line: "6",
    		time: "4"
    	},
    	{
    		station1: "90",
    		station2: "104",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "90",
    		station2: "145",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "92",
    		station2: "145",
    		line: "6",
    		time: "4"
    	},
    	{
    		station1: "101",
    		station2: "110",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "101",
    		station2: "227",
    		line: "6",
    		time: "1"
    	},
    	{
    		station1: "147",
    		station2: "150",
    		line: "6",
    		time: "1"
    	},
    	{
    		station1: "147",
    		station2: "283",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "150",
    		station2: "227",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "156",
    		station2: "167",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "164",
    		station2: "244",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "193",
    		station2: "218",
    		line: "6",
    		time: "1"
    	},
    	{
    		station1: "200",
    		station2: "270",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "200",
    		station2: "289",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "218",
    		station2: "283",
    		line: "6",
    		time: "2"
    	},
    	{
    		station1: "244",
    		station2: "295",
    		line: "6",
    		time: "3"
    	},
    	{
    		station1: "11",
    		station2: "28",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "11",
    		station2: "249",
    		line: "7",
    		time: "4"
    	},
    	{
    		station1: "23",
    		station2: "41",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "23",
    		station2: "157",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "28",
    		station2: "107",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "41",
    		station2: "42",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "42",
    		station2: "183",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "43",
    		station2: "183",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "43",
    		station2: "289",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "45",
    		station2: "207",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "45",
    		station2: "243",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "71",
    		station2: "172",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "71",
    		station2: "297",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "94",
    		station2: "254",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "94",
    		station2: "290",
    		line: "7",
    		time: "1"
    	},
    	{
    		station1: "107",
    		station2: "285",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "142",
    		station2: "290",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "142",
    		station2: "297",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "144",
    		station2: "207",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "144",
    		station2: "282",
    		line: "7",
    		time: "4"
    	},
    	{
    		station1: "157",
    		station2: "233",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "172",
    		station2: "282",
    		line: "7",
    		time: "4"
    	},
    	{
    		station1: "233",
    		station2: "279",
    		line: "7",
    		time: "1"
    	},
    	{
    		station1: "247",
    		station2: "289",
    		line: "7",
    		time: "3"
    	},
    	{
    		station1: "249",
    		station2: "254",
    		line: "7",
    		time: "1"
    	},
    	{
    		station1: "279",
    		station2: "285",
    		line: "7",
    		time: "2"
    	},
    	{
    		station1: "2",
    		station2: "156",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "6",
    		station2: "46",
    		line: "8",
    		time: "4"
    	},
    	{
    		station1: "11",
    		station2: "94",
    		line: "8",
    		time: "6"
    	},
    	{
    		station1: "11",
    		station2: "104",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "14",
    		station2: "92",
    		line: "8",
    		time: "1"
    	},
    	{
    		station1: "14",
    		station2: "167",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "46",
    		station2: "50",
    		line: "8",
    		time: "8"
    	},
    	{
    		station1: "46",
    		station2: "53",
    		line: "8",
    		time: "4"
    	},
    	{
    		station1: "53",
    		station2: "214",
    		line: "8",
    		time: "4"
    	},
    	{
    		station1: "62",
    		station2: "168",
    		line: "8",
    		time: "4"
    	},
    	{
    		station1: "62",
    		station2: "280",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "75",
    		station2: "210",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "75",
    		station2: "222",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "90",
    		station2: "104",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "90",
    		station2: "145",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "92",
    		station2: "145",
    		line: "8",
    		time: "4"
    	},
    	{
    		station1: "94",
    		station2: "282",
    		line: "8",
    		time: "7"
    	},
    	{
    		station1: "115",
    		station2: "178",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "115",
    		station2: "184",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "115",
    		station2: "291",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "125",
    		station2: "134",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "125",
    		station2: "271",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "134",
    		station2: "220",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "156",
    		station2: "167",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "168",
    		station2: "179",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "168",
    		station2: "214",
    		line: "8",
    		time: "4"
    	},
    	{
    		station1: "178",
    		station2: "202",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "179",
    		station2: "180",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "180",
    		station2: "199",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "184",
    		station2: "199",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "202",
    		station2: "282",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "210",
    		station2: "291",
    		line: "8",
    		time: "3"
    	},
    	{
    		station1: "220",
    		station2: "222",
    		line: "8",
    		time: "2"
    	},
    	{
    		station1: "7",
    		station2: "145",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "7",
    		station2: "188",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "8",
    		station2: "124",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "8",
    		station2: "264",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "12",
    		station2: "56",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "12",
    		station2: "257",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "13",
    		station2: "157",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "13",
    		station2: "167",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "22",
    		station2: "47",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "22",
    		station2: "111",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "29",
    		station2: "84",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "29",
    		station2: "157",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "34",
    		station2: "100",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "34",
    		station2: "119",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "38",
    		station2: "58",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "38",
    		station2: "81",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "40",
    		station2: "47",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "40",
    		station2: "89",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "40",
    		station2: "139",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "40",
    		station2: "170",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "49",
    		station2: "87",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "49",
    		station2: "151",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "54",
    		station2: "55",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "54",
    		station2: "56",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "55",
    		station2: "245",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "58",
    		station2: "119",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "59",
    		station2: "240",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "59",
    		station2: "258",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "77",
    		station2: "93",
    		line: "9",
    		time: "4"
    	},
    	{
    		station1: "77",
    		station2: "124",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "84",
    		station2: "136",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "87",
    		station2: "279",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "89",
    		station2: "145",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "89",
    		station2: "170",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "89",
    		station2: "277",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "93",
    		station2: "165",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "93",
    		station2: "288",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "100",
    		station2: "111",
    		line: "9",
    		time: "4"
    	},
    	{
    		station1: "102",
    		station2: "259",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "102",
    		station2: "277",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "121",
    		station2: "261",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "136",
    		station2: "191",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "136",
    		station2: "279",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "139",
    		station2: "264",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "151",
    		station2: "259",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "167",
    		station2: "188",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "169",
    		station2: "240",
    		line: "9",
    		time: "4"
    	},
    	{
    		station1: "191",
    		station2: "245",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "257",
    		station2: "258",
    		line: "9",
    		time: "2"
    	},
    	{
    		station1: "261",
    		station2: "302",
    		line: "9",
    		time: "3"
    	},
    	{
    		station1: "288",
    		station2: "302",
    		line: "9",
    		time: "1"
    	},
    	{
    		station1: "1",
    		station2: "73",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "1",
    		station2: "234",
    		line: "10",
    		time: "4"
    	},
    	{
    		station1: "1",
    		station2: "265",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "5",
    		station2: "194",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "5",
    		station2: "252",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "9",
    		station2: "31",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "9",
    		station2: "232",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "10",
    		station2: "95",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "10",
    		station2: "128",
    		line: "10",
    		time: "1"
    	},
    	{
    		station1: "17",
    		station2: "74",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "17",
    		station2: "110",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "30",
    		station2: "176",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "30",
    		station2: "190",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "31",
    		station2: "303",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "39",
    		station2: "128",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "39",
    		station2: "145",
    		line: "10",
    		time: "5"
    	},
    	{
    		station1: "57",
    		station2: "187",
    		line: "10",
    		time: "4"
    	},
    	{
    		station1: "60",
    		station2: "126",
    		line: "10",
    		time: "1"
    	},
    	{
    		station1: "60",
    		station2: "151",
    		line: "10",
    		time: "1"
    	},
    	{
    		station1: "73",
    		station2: "182",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "74",
    		station2: "99",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "75",
    		station2: "210",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "75",
    		station2: "222",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "95",
    		station2: "160",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "99",
    		station2: "236",
    		line: "10",
    		time: "1"
    	},
    	{
    		station1: "107",
    		station2: "133",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "107",
    		station2: "197",
    		line: "10",
    		time: "1"
    	},
    	{
    		station1: "110",
    		station2: "265",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "116",
    		station2: "117",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "116",
    		station2: "118",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "116",
    		station2: "132",
    		line: "10",
    		time: "4"
    	},
    	{
    		station1: "117",
    		station2: "118",
    		line: "10",
    		time: "5"
    	},
    	{
    		station1: "125",
    		station2: "134",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "125",
    		station2: "271",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "126",
    		station2: "223",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "130",
    		station2: "131",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "130",
    		station2: "132",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "131",
    		station2: "190",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "133",
    		station2: "146",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "134",
    		station2: "220",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "145",
    		station2: "223",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "146",
    		station2: "236",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "151",
    		station2: "197",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "160",
    		station2: "266",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "176",
    		station2: "234",
    		line: "10",
    		time: "1"
    	},
    	{
    		station1: "182",
    		station2: "194",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "187",
    		station2: "232",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "210",
    		station2: "235",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "220",
    		station2: "222",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "235",
    		station2: "251",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "251",
    		station2: "252",
    		line: "10",
    		time: "3"
    	},
    	{
    		station1: "266",
    		station2: "303",
    		line: "10",
    		time: "2"
    	},
    	{
    		station1: "26",
    		station2: "260",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "26",
    		station2: "274",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "35",
    		station2: "245",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "89",
    		station2: "145",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "89",
    		station2: "277",
    		line: "11",
    		time: "1"
    	},
    	{
    		station1: "95",
    		station2: "123",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "95",
    		station2: "224",
    		line: "11",
    		time: "4"
    	},
    	{
    		station1: "107",
    		station2: "192",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "107",
    		station2: "273",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "123",
    		station2: "145",
    		line: "11",
    		time: "4"
    	},
    	{
    		station1: "192",
    		station2: "277",
    		line: "11",
    		time: "2"
    	},
    	{
    		station1: "198",
    		station2: "272",
    		line: "11",
    		time: "1"
    	},
    	{
    		station1: "198",
    		station2: "273",
    		line: "11",
    		time: "3"
    	},
    	{
    		station1: "224",
    		station2: "260",
    		line: "11",
    		time: "3"
    	},
    	{
    		station1: "245",
    		station2: "272",
    		line: "11",
    		time: "3"
    	},
    	{
    		station1: "13",
    		station2: "279",
    		line: "12",
    		time: "4"
    	}
    ];
    var lines = [
    	{
    		line: "1",
    		name: "Bakerloo Line",
    		colour: "AE6017",
    		stripe: "NULL"
    	},
    	{
    		line: "3",
    		name: "Circle Line",
    		colour: "FFE02B",
    		stripe: "NULL"
    	},
    	{
    		line: "6",
    		name: "Hammersmith & City Line",
    		colour: "F491A8",
    		stripe: "NULL"
    	},
    	{
    		line: "7",
    		name: "Jubilee Line",
    		colour: "949699",
    		stripe: "NULL"
    	},
    	{
    		line: "11",
    		name: "Victoria Line",
    		colour: "0A9CDA",
    		stripe: "NULL"
    	},
    	{
    		line: "2",
    		name: "Central Line",
    		colour: "F15B2E",
    		stripe: "NULL"
    	},
    	{
    		line: "4",
    		name: "District Line",
    		colour: "00A166",
    		stripe: "NULL"
    	},
    	{
    		line: "5",
    		name: "East London Line",
    		colour: "FBAE34",
    		stripe: "NULL"
    	},
    	{
    		line: "8",
    		name: "Metropolitan Line",
    		colour: "91005A",
    		stripe: "NULL"
    	},
    	{
    		line: "9",
    		name: "Northern Line",
    		colour: "000000",
    		stripe: "NULL"
    	},
    	{
    		line: "10",
    		name: "Piccadilly Line",
    		colour: "094FA3",
    		stripe: "NULL"
    	},
    	{
    		line: "12",
    		name: "Waterloo & City Line",
    		colour: "88D0C4",
    		stripe: "NULL"
    	},
    	{
    		line: "13",
    		name: "Docklands Light Railway",
    		colour: "00A77E",
    		stripe: "FFFFFF"
    	}
    ];
    var stations = [
    	{
    		id: "1",
    		latitude: "51.5028",
    		longitude: "-0.2801",
    		name: "Acton Town",
    		display_name: "Acton<br />Town",
    		zone: "3",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "2",
    		latitude: "51.5143",
    		longitude: "-0.0755",
    		name: "Aldgate",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "3",
    		latitude: "51.5154",
    		longitude: "-0.0726",
    		name: "Aldgate East",
    		display_name: "Aldgate<br />East",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "4",
    		latitude: "51.5107",
    		longitude: "-0.013",
    		name: "All Saints",
    		display_name: "All<br />Saints",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "5",
    		latitude: "51.5407",
    		longitude: "-0.2997",
    		name: "Alperton",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "7",
    		latitude: "51.5322",
    		longitude: "-0.1058",
    		name: "Angel",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "8",
    		latitude: "51.5653",
    		longitude: "-0.1353",
    		name: "Archway",
    		display_name: "NULL",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "9",
    		latitude: "51.6164",
    		longitude: "-0.1331",
    		name: "Arnos Grove",
    		display_name: "Arnos<br />Grove",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "10",
    		latitude: "51.5586",
    		longitude: "-0.1059",
    		name: "Arsenal",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "11",
    		latitude: "51.5226",
    		longitude: "-0.1571",
    		name: "Baker Street",
    		display_name: "Baker<br />Street",
    		zone: "1",
    		total_lines: "5",
    		rail: "0"
    	},
    	{
    		id: "12",
    		latitude: "51.4431",
    		longitude: "-0.1525",
    		name: "Balham",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "13",
    		latitude: "51.5133",
    		longitude: "-0.0886",
    		name: "Bank",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "4",
    		rail: "0"
    	},
    	{
    		id: "14",
    		latitude: "51.5204",
    		longitude: "-0.0979",
    		name: "Barbican",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "15",
    		latitude: "51.5396",
    		longitude: "0.081",
    		name: "Barking",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "2",
    		rail: "1"
    	},
    	{
    		id: "16",
    		latitude: "51.5856",
    		longitude: "0.0887",
    		name: "Barkingside",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "17",
    		latitude: "51.4905",
    		longitude: "-0.2139",
    		name: "Barons Court",
    		display_name: "Barons<br />Court",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "18",
    		latitude: "51.5121",
    		longitude: "-0.1879",
    		name: "Bayswater",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "19",
    		latitude: "51.5148",
    		longitude: "0.0613",
    		name: "Beckton",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "20",
    		latitude: "51.5087",
    		longitude: "0.055",
    		name: "Beckton Park",
    		display_name: "Beckton<br />Park",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "21",
    		latitude: "51.5403",
    		longitude: "0.127",
    		name: "Becontree",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "22",
    		latitude: "51.5504",
    		longitude: "-0.1642",
    		name: "Belsize Park",
    		display_name: "Belsize<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "24",
    		latitude: "51.527",
    		longitude: "-0.0549",
    		name: "Bethnal Green",
    		display_name: "Bethnal<br />Green",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "25",
    		latitude: "51.512",
    		longitude: "-0.1031",
    		name: "Blackfriars",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "26",
    		latitude: "51.5867",
    		longitude: "-0.0417",
    		name: "Blackhorse Road",
    		display_name: "Blackhorse<br />Road",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "27",
    		latitude: "51.5079",
    		longitude: "-0.0066",
    		name: "Blackwall",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "28",
    		latitude: "51.5142",
    		longitude: "-0.1494",
    		name: "Bond Street",
    		display_name: "Bond<br />Street",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "29",
    		latitude: "51.5011",
    		longitude: "-0.0943",
    		name: "Borough",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "30",
    		latitude: "51.4956",
    		longitude: "-0.325",
    		name: "Boston Manor",
    		display_name: "Boston<br />Manor",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "31",
    		latitude: "51.6071",
    		longitude: "-0.1243",
    		name: "Bounds Green",
    		display_name: "Bounds<br />Green",
    		zone: "3.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "32",
    		latitude: "51.5273",
    		longitude: "-0.0208",
    		name: "Bow Church",
    		display_name: "Bow<br />Church",
    		zone: "2",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "33",
    		latitude: "51.5269",
    		longitude: "-0.0247",
    		name: "Bow Road",
    		display_name: "Bow<br />Road",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "34",
    		latitude: "51.5766",
    		longitude: "-0.2136",
    		name: "Brent Cross",
    		display_name: "Brent<br />Cross",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "36",
    		latitude: "51.5248",
    		longitude: "-0.0119",
    		name: "Bromley-By-Bow",
    		display_name: "NULL",
    		zone: "2.5",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "38",
    		latitude: "51.6028",
    		longitude: "-0.2641",
    		name: "Burnt Oak",
    		display_name: "Burnt<br />Oak",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "39",
    		latitude: "51.5481",
    		longitude: "-0.1188",
    		name: "Caledonian Road",
    		display_name: "Caledonian<br />Road",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "40",
    		latitude: "51.5392",
    		longitude: "-0.1426",
    		name: "Camden Town",
    		display_name: "Camden<br />Town",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "42",
    		latitude: "51.5051",
    		longitude: "-0.0209",
    		name: "Canary Wharf",
    		display_name: "Canary<br />Wharf",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "44",
    		latitude: "51.5113",
    		longitude: "-0.0904",
    		name: "Cannon Street",
    		display_name: "Cannon<br />Street",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "45",
    		latitude: "51.6078",
    		longitude: "-0.2947",
    		name: "Canons Park",
    		display_name: "Canons<br />Park",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "47",
    		latitude: "51.5441",
    		longitude: "-0.1538",
    		name: "Chalk Farm",
    		display_name: "Chalk<br />Farm",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "48",
    		latitude: "51.5185",
    		longitude: "-0.1111",
    		name: "Chancery Lane",
    		display_name: "Chancery<br />Lane",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "49",
    		latitude: "51.508",
    		longitude: "-0.1247",
    		name: "Charing Cross",
    		display_name: "Charing<br />Cross",
    		zone: "1",
    		total_lines: "2",
    		rail: "1"
    	},
    	{
    		id: "51",
    		latitude: "51.6177",
    		longitude: "0.0755",
    		name: "Chigwell",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "52",
    		latitude: "51.4946",
    		longitude: "-0.2678",
    		name: "Chiswick Park",
    		display_name: "Chiswick<br />Park",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "54",
    		latitude: "51.4618",
    		longitude: "-0.1384",
    		name: "Clapham Common",
    		display_name: "Clapham<br />Common",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "55",
    		latitude: "51.4649",
    		longitude: "-0.1299",
    		name: "Clapham North",
    		display_name: "Clapham<br />North",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "56",
    		latitude: "51.4527",
    		longitude: "-0.148",
    		name: "Clapham South",
    		display_name: "Clapham<br />South",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "58",
    		latitude: "51.5955",
    		longitude: "-0.2502",
    		name: "Colindale",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "59",
    		latitude: "51.418",
    		longitude: "-0.1778",
    		name: "Colliers Wood",
    		display_name: "Colliers<br />Wood",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "60",
    		latitude: "51.5129",
    		longitude: "-0.1243",
    		name: "Covent Garden",
    		display_name: "Covent<br />Garden",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "61",
    		latitude: "51.4957",
    		longitude: "-0.0144",
    		name: "Crossharbour & London Arena",
    		display_name: "Crossharbour &<br />London Arena",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "63",
    		latitude: "51.5095",
    		longitude: "0.0276",
    		name: "Custom House",
    		display_name: "Custom<br />House",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "65",
    		latitude: "51.5085",
    		longitude: "0.064",
    		name: "Cyprus",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "66",
    		latitude: "51.5443",
    		longitude: "0.1655",
    		name: "Dagenham East",
    		display_name: "Dagenham<br />East",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "67",
    		latitude: "51.5417",
    		longitude: "0.1469",
    		name: "Dagenham Heathway",
    		display_name: "Dagenham<br />Heathway",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "70",
    		latitude: "51.5223",
    		longitude: "-0.0173",
    		name: "Devons Road",
    		display_name: "Devons<br />Road",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "71",
    		latitude: "51.552",
    		longitude: "-0.2387",
    		name: "Dollis Hill",
    		display_name: "Dollis<br />Hill",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "72",
    		latitude: "51.5152",
    		longitude: "-0.3017",
    		name: "Ealing Broadway",
    		display_name: "Ealing<br />Broadway",
    		zone: "3",
    		total_lines: "2",
    		rail: "1"
    	},
    	{
    		id: "73",
    		latitude: "51.5101",
    		longitude: "-0.2882",
    		name: "Ealing Common",
    		display_name: "Ealing<br />Common",
    		zone: "3",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "74",
    		latitude: "51.492",
    		longitude: "-0.1973",
    		name: "Earl's Court",
    		display_name: "Earl's<br />Court",
    		zone: "1.5",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "75",
    		latitude: "51.5765",
    		longitude: "-0.397",
    		name: "Eastcote",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "76",
    		latitude: "51.5168",
    		longitude: "-0.2474",
    		name: "East Acton",
    		display_name: "East<br />Acton",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "77",
    		latitude: "51.5874",
    		longitude: "-0.165",
    		name: "East Finchley",
    		display_name: "East<br />Finchley",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "78",
    		latitude: "51.5394",
    		longitude: "0.0518",
    		name: "East Ham",
    		display_name: "East<br />Ham",
    		zone: "3.5",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "79",
    		latitude: "51.5093",
    		longitude: "-0.0021",
    		name: "East India",
    		display_name: "East<br />India",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "80",
    		latitude: "51.4586",
    		longitude: "-0.2112",
    		name: "East Putney",
    		display_name: "East<br />Putney",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "81",
    		latitude: "51.6137",
    		longitude: "-0.275",
    		name: "Edgware",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "82",
    		latitude: "51.5199",
    		longitude: "-0.1679",
    		name: "Edgware Road (B)",
    		display_name: "Edgware<br />Road",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "83",
    		latitude: "51.5203",
    		longitude: "-0.17",
    		name: "Edgware Road (C)",
    		display_name: "Edgware<br />Road",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "84",
    		latitude: "51.4943",
    		longitude: "-0.1001",
    		name: "Elephant & Castle",
    		display_name: "Elephant &<br />Castle",
    		zone: "1.5",
    		total_lines: "2",
    		rail: "1"
    	},
    	{
    		id: "85",
    		latitude: "51.5496",
    		longitude: "0.1977",
    		name: "Elm Park",
    		display_name: "Elm<br />Park",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "87",
    		latitude: "51.5074",
    		longitude: "-0.1223",
    		name: "Embankment",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "4",
    		rail: "0"
    	},
    	{
    		id: "89",
    		latitude: "51.5282",
    		longitude: "-0.1337",
    		name: "Euston",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "1"
    	},
    	{
    		id: "90",
    		latitude: "51.526",
    		longitude: "-0.1359",
    		name: "Euston Square",
    		display_name: "Euston<br />Square",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "91",
    		latitude: "51.596",
    		longitude: "0.0912",
    		name: "Fairlop",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "92",
    		latitude: "51.5203",
    		longitude: "-0.1053",
    		name: "Farringdon",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "3",
    		rail: "1"
    	},
    	{
    		id: "93",
    		latitude: "51.6012",
    		longitude: "-0.1932",
    		name: "Finchley Central",
    		display_name: "Finchley<br />Central",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "94",
    		latitude: "51.5472",
    		longitude: "-0.1803",
    		name: "Finchley Road",
    		display_name: "Finchley<br />Road",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "95",
    		latitude: "51.5642",
    		longitude: "-0.1065",
    		name: "Finsbury Park",
    		display_name: "Finsbury<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "96",
    		latitude: "51.4804",
    		longitude: "-0.195",
    		name: "Fulham Broadway",
    		display_name: "Fulham<br />Broadway",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "97",
    		latitude: "51.5096",
    		longitude: "0.0716",
    		name: "Gallions Reach",
    		display_name: "Gallions<br />Reach",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "98",
    		latitude: "51.5765",
    		longitude: "0.0663",
    		name: "Gants Hill",
    		display_name: "Gants<br />Hill",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "99",
    		latitude: "51.4945",
    		longitude: "-0.1829",
    		name: "Gloucester Road",
    		display_name: "Gloucester<br />Road",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "100",
    		latitude: "51.5724",
    		longitude: "-0.1941",
    		name: "Golders Green",
    		display_name: "Golders<br />Green",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "101",
    		latitude: "51.5018",
    		longitude: "-0.2267",
    		name: "Goldhawk Road",
    		display_name: "Goldhawk<br />Road",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "102",
    		latitude: "51.5205",
    		longitude: "-0.1347",
    		name: "Goodge Street",
    		display_name: "Goodge<br />Street",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "103",
    		latitude: "51.6132",
    		longitude: "0.0923",
    		name: "Grange Hill",
    		display_name: "Grange<br />Hill",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "104",
    		latitude: "51.5238",
    		longitude: "-0.1439",
    		name: "Great Portland Street",
    		display_name: "Great<br />Portland<br />Street",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "105",
    		latitude: "51.5423",
    		longitude: "-0.3456",
    		name: "Greenford",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "107",
    		latitude: "51.5067",
    		longitude: "-0.1428",
    		name: "Green Park",
    		display_name: "Green<br />Park",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "108",
    		latitude: "51.4915",
    		longitude: "-0.2754",
    		name: "Gunnersbury",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "109",
    		latitude: "51.603",
    		longitude: "0.0933",
    		name: "Hainault",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "110",
    		latitude: "51.4936",
    		longitude: "-0.2251",
    		name: "Hammersmith",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "111",
    		latitude: "51.5568",
    		longitude: "-0.178",
    		name: "Hampstead",
    		display_name: "NULL",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "112",
    		latitude: "51.5302",
    		longitude: "-0.2933",
    		name: "Hanger Lane",
    		display_name: "Hanger<br />Lane",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "113",
    		latitude: "51.5362",
    		longitude: "-0.2575",
    		name: "Harlesden",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "114",
    		latitude: "51.5925",
    		longitude: "-0.3351",
    		name: "Harrow & Wealdston",
    		display_name: "Harrow &<br />Wealdston",
    		zone: "5",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "115",
    		latitude: "51.5793",
    		longitude: "-0.3366",
    		name: "Harrow-on-the-Hill",
    		display_name: "Harrow-<br />on-the-Hill",
    		zone: "5",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "116",
    		latitude: "51.4669",
    		longitude: "-0.4227",
    		name: "Hatton Cross",
    		display_name: "Hatton<br />Cross",
    		zone: "5.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "117",
    		latitude: "51.4713",
    		longitude: "-0.4524",
    		name: "Heathrow Terminals 1, 2 & 3",
    		display_name: "Heathrow<br />Terminals<br />1, 2 & 3",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "118",
    		latitude: "51.4598",
    		longitude: "-0.4476",
    		name: "Heathrow Terminal 4",
    		display_name: "Heathrow<br />Terminal 4",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "119",
    		latitude: "51.5829",
    		longitude: "-0.2259",
    		name: "Hendon Central",
    		display_name: "Hendon<br />Central",
    		zone: "3.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "120",
    		latitude: "51.5033",
    		longitude: "-0.0215",
    		name: "Heron Quays",
    		display_name: "Heron<br />Quays",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "122",
    		latitude: "51.5009",
    		longitude: "-0.1925",
    		name: "High Street Kensington",
    		display_name: "High<br />Street<br />Kensington",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "123",
    		latitude: "51.546",
    		longitude: "-0.104",
    		name: "Highbury & Islington",
    		display_name: "Highbury &<br />Islington",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "124",
    		latitude: "51.5777",
    		longitude: "-0.1458",
    		name: "Highgate",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "125",
    		latitude: "51.5538",
    		longitude: "-0.4499",
    		name: "Hillingdon",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "126",
    		latitude: "51.5174",
    		longitude: "-0.12",
    		name: "Holborn",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "127",
    		latitude: "51.5075",
    		longitude: "-0.206",
    		name: "Holland Park",
    		display_name: "Holland<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "128",
    		latitude: "51.5526",
    		longitude: "-0.1132",
    		name: "Holloway Road",
    		display_name: "Holloway<br />Road",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "129",
    		latitude: "51.5539",
    		longitude: "0.2184",
    		name: "Hornchurch",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "130",
    		latitude: "51.4713",
    		longitude: "-0.3665",
    		name: "Hounslow Central",
    		display_name: "Hounslow<br />Central",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "131",
    		latitude: "51.4733",
    		longitude: "-0.3564",
    		name: "Hounslow East",
    		display_name: "Hounslow<br />East",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "132",
    		latitude: "51.4734",
    		longitude: "-0.3855",
    		name: "Hounslow West",
    		display_name: "Hounslow<br />West",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "133",
    		latitude: "51.5027",
    		longitude: "-0.1527",
    		name: "Hyde Park Corner",
    		display_name: "Hyde<br />Park<br />Corner",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "134",
    		latitude: "51.5619",
    		longitude: "-0.4421",
    		name: "Ickenham",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "135",
    		latitude: "51.4871",
    		longitude: "-0.0101",
    		name: "Island Gardens",
    		display_name: "Island<br />Gardens",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "136",
    		latitude: "51.4884",
    		longitude: "-0.1053",
    		name: "Kennington",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "137",
    		latitude: "51.5304",
    		longitude: "-0.225",
    		name: "Kensal Green",
    		display_name: "Kensal<br />Green",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "138",
    		latitude: "51.4983",
    		longitude: "-0.2106",
    		name: "Kensington (Olympia)",
    		display_name: "Kensington<br />(Olympia)",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "139",
    		latitude: "51.5507",
    		longitude: "-0.1402",
    		name: "Kentish Town",
    		display_name: "Kentish<br />Town",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "140",
    		latitude: "51.5816",
    		longitude: "-0.3162",
    		name: "Kenton",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "141",
    		latitude: "51.477",
    		longitude: "-0.285",
    		name: "Kew Gardens",
    		display_name: "Kew<br />Gardens",
    		zone: "3.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "142",
    		latitude: "51.5471",
    		longitude: "-0.2047",
    		name: "Kilburn",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "143",
    		latitude: "51.5351",
    		longitude: "-0.1939",
    		name: "Kilburn Park",
    		display_name: "Kilburn<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "144",
    		latitude: "51.5846",
    		longitude: "-0.2786",
    		name: "Kingsbury",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "145",
    		latitude: "51.5308",
    		longitude: "-0.1238",
    		name: "King's Cross St. Pancras",
    		display_name: "King's Cross<br />St. Pancras",
    		zone: "1",
    		total_lines: "6",
    		rail: "1"
    	},
    	{
    		id: "146",
    		latitude: "51.5015",
    		longitude: "-0.1607",
    		name: "Knightsbridge",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "147",
    		latitude: "51.5172",
    		longitude: "-0.2107",
    		name: "Ladbroke Grove",
    		display_name: "Ladbroke<br />Grove",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "148",
    		latitude: "51.4991",
    		longitude: "-0.1115",
    		name: "Lambeth North",
    		display_name: "Lambeth<br />North",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "149",
    		latitude: "51.5119",
    		longitude: "-0.1756",
    		name: "Lancaster Gate",
    		display_name: "Lancaster<br />Gate",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "150",
    		latitude: "51.5139",
    		longitude: "-0.2172",
    		name: "Latimer Road",
    		display_name: "Latimer<br />Road",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "151",
    		latitude: "51.5113",
    		longitude: "-0.1281",
    		name: "Leicester Square",
    		display_name: "Leicester<br />Square",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "153",
    		latitude: "51.5566",
    		longitude: "-0.0053",
    		name: "Leyton",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "154",
    		latitude: "51.5683",
    		longitude: "0.0083",
    		name: "Leytonstone",
    		display_name: "NULL",
    		zone: "3.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "155",
    		latitude: "51.5123",
    		longitude: "-0.0396",
    		name: "Limehouse",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "156",
    		latitude: "51.5178",
    		longitude: "-0.0823",
    		name: "Liverpool Street",
    		display_name: "Liverpool<br />Street",
    		zone: "1",
    		total_lines: "4",
    		rail: "1"
    	},
    	{
    		id: "157",
    		latitude: "51.5052",
    		longitude: "-0.0864",
    		name: "London Bridge",
    		display_name: "London<br />Bridge",
    		zone: "1",
    		total_lines: "2",
    		rail: "1"
    	},
    	{
    		id: "159",
    		latitude: "51.53",
    		longitude: "-0.1854",
    		name: "Maida Vale",
    		display_name: "Maida<br />Vale",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "160",
    		latitude: "51.5712",
    		longitude: "-0.0958",
    		name: "Manor House",
    		display_name: "Manor<br />House",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "161",
    		latitude: "51.5122",
    		longitude: "-0.094",
    		name: "Mansion House",
    		display_name: "Mansion<br />House",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "162",
    		latitude: "51.5136",
    		longitude: "-0.1586",
    		name: "Marble Arch",
    		display_name: "Marble<br />Arch",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "163",
    		latitude: "51.5225",
    		longitude: "-0.1631",
    		name: "Marylebone",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "164",
    		latitude: "51.5249",
    		longitude: "-0.0332",
    		name: "Mile End",
    		display_name: "Mile<br />End",
    		zone: "2",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "165",
    		latitude: "51.6082",
    		longitude: "-0.2103",
    		name: "Mill Hill East",
    		display_name: "Mill<br />Hill<br />East",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "166",
    		latitude: "51.5108",
    		longitude: "-0.0863",
    		name: "Monument",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "167",
    		latitude: "51.5186",
    		longitude: "-0.0886",
    		name: "Moorgate",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "4",
    		rail: "1"
    	},
    	{
    		id: "168",
    		latitude: "51.6294",
    		longitude: "-0.432",
    		name: "Moor Park",
    		display_name: "Moor<br />Park",
    		zone: "6.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "169",
    		latitude: "51.4022",
    		longitude: "-0.1948",
    		name: "Morden",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "170",
    		latitude: "51.5342",
    		longitude: "-0.1387",
    		name: "Mornington Crescent",
    		display_name: "Mornington<br />Crescent",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "171",
    		latitude: "51.4902",
    		longitude: "-0.0145",
    		name: "Mudchute",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "172",
    		latitude: "51.5542",
    		longitude: "-0.2503",
    		name: "Neasden",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "173",
    		latitude: "51.5756",
    		longitude: "0.0899",
    		name: "Newbury Park",
    		display_name: "Newbury<br />Park",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "176",
    		latitude: "51.4995",
    		longitude: "-0.3142",
    		name: "Northfields",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "177",
    		latitude: "51.5483",
    		longitude: "-0.3687",
    		name: "Northolt",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "178",
    		latitude: "51.5784",
    		longitude: "-0.3184",
    		name: "Northwick Park",
    		display_name: "Northwick<br />Park",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "179",
    		latitude: "51.6111",
    		longitude: "-0.424",
    		name: "Northwood",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "180",
    		latitude: "51.6004",
    		longitude: "-0.4092",
    		name: "Northwood Hills",
    		display_name: "Northwood<br />Hills",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "181",
    		latitude: "51.5237",
    		longitude: "-0.2597",
    		name: "North Acton",
    		display_name: "North<br />Acton",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "182",
    		latitude: "51.5175",
    		longitude: "-0.2887",
    		name: "North Ealing",
    		display_name: "North<br />Ealing",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "184",
    		latitude: "51.5846",
    		longitude: "-0.3626",
    		name: "North Harrow",
    		display_name: "North<br />Harrow",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "185",
    		latitude: "51.5621",
    		longitude: "-0.3034",
    		name: "North Wembley",
    		display_name: "North<br />Wembley",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "186",
    		latitude: "51.5094",
    		longitude: "-0.1967",
    		name: "Notting Hill Gate",
    		display_name: "Notting<br />Hill Gate",
    		zone: "1.5",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "188",
    		latitude: "51.5263",
    		longitude: "-0.0873",
    		name: "Old Street",
    		display_name: "Old<br />Street",
    		zone: "1",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "190",
    		latitude: "51.4813",
    		longitude: "-0.3522",
    		name: "Osterley",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "191",
    		latitude: "51.4819",
    		longitude: "-0.113",
    		name: "Oval",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "192",
    		latitude: "51.515",
    		longitude: "-0.1415",
    		name: "Oxford Circus",
    		display_name: "Oxford<br />Circus",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "193",
    		latitude: "51.5154",
    		longitude: "-0.1755",
    		name: "Paddington",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "4",
    		rail: "1"
    	},
    	{
    		id: "194",
    		latitude: "51.527",
    		longitude: "-0.2841",
    		name: "Park Royal",
    		display_name: "Park<br />Royal",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "195",
    		latitude: "51.4753",
    		longitude: "-0.2011",
    		name: "Parsons Green",
    		display_name: "Parsons<br />Green",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "196",
    		latitude: "51.5366",
    		longitude: "-0.3232",
    		name: "Perivale",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "197",
    		latitude: "51.5098",
    		longitude: "-0.1342",
    		name: "Picadilly Circus",
    		display_name: "Picadilly<br />Circus",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "198",
    		latitude: "51.4893",
    		longitude: "-0.1334",
    		name: "Pimlico",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "199",
    		latitude: "51.5926",
    		longitude: "-0.3805",
    		name: "Pinner",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "200",
    		latitude: "51.5313",
    		longitude: "0.0172",
    		name: "Plaistow",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "201",
    		latitude: "51.5077",
    		longitude: "-0.0173",
    		name: "Poplar",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "202",
    		latitude: "51.572",
    		longitude: "-0.2954",
    		name: "Preston Road",
    		display_name: "Preston<br />Road",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "203",
    		latitude: "51.5093",
    		longitude: "0.0336",
    		name: "Prince Regent",
    		display_name: "Prince<br />Regent",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "205",
    		latitude: "51.4682",
    		longitude: "-0.2089",
    		name: "Putney Bridge",
    		display_name: "Putney<br />Bridge",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "206",
    		latitude: "51.5341",
    		longitude: "-0.2047",
    		name: "Queen's Park",
    		display_name: "Queens<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "207",
    		latitude: "51.5942",
    		longitude: "-0.2861",
    		name: "Queensbury",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "208",
    		latitude: "51.5107",
    		longitude: "-0.1877",
    		name: "Queensway",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "209",
    		latitude: "51.4942",
    		longitude: "-0.2359",
    		name: "Ravenscourt Park",
    		display_name: "Ravenscourt<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "210",
    		latitude: "51.5753",
    		longitude: "-0.3714",
    		name: "Rayners Lane",
    		display_name: "Rayners<br />Lane",
    		zone: "5",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "211",
    		latitude: "51.5763",
    		longitude: "0.0454",
    		name: "Redbridge",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "212",
    		latitude: "51.5234",
    		longitude: "-0.1466",
    		name: "Regent's Park",
    		display_name: "Regent's<br />Park",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "213",
    		latitude: "51.4633",
    		longitude: "-0.3013",
    		name: "Richmond",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "215",
    		latitude: "51.6171",
    		longitude: "0.0439",
    		name: "Roding Valley",
    		display_name: "Roding<br />Valley",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "216",
    		latitude: "51.501",
    		longitude: "-0.0525",
    		name: "Rotherhithe",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "217",
    		latitude: "51.5084",
    		longitude: "0.0465",
    		name: "Royal Albert",
    		display_name: "Royal<br />Albert",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "218",
    		latitude: "51.519",
    		longitude: "-0.188",
    		name: "Royal Oak",
    		display_name: "Royal<br />Oak",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "219",
    		latitude: "51.5091",
    		longitude: "0.0181",
    		name: "Royal Victoria",
    		display_name: "Royal<br />Victoria",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "220",
    		latitude: "51.5715",
    		longitude: "-0.4213",
    		name: "Ruislip",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "222",
    		latitude: "51.5732",
    		longitude: "-0.4125",
    		name: "Ruislip Manor",
    		display_name: "Ruislip<br />Manor",
    		zone: "6",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "223",
    		latitude: "51.523",
    		longitude: "-0.1244",
    		name: "Russell Square",
    		display_name: "Russell<br />Square",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "224",
    		latitude: "51.5822",
    		longitude: "-0.0749",
    		name: "Seven Sisters",
    		display_name: "Seven<br />Sisters",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "225",
    		latitude: "51.5117",
    		longitude: "-0.056",
    		name: "Shadwell",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "226",
    		latitude: "51.5046",
    		longitude: "-0.2187",
    		name: "Shepherd's Bush (C)",
    		display_name: "Shepherd's<br />Bush",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "227",
    		latitude: "51.5058",
    		longitude: "-0.2265",
    		name: "Shepherd's Bush (H)",
    		display_name: "Shepherd's<br />Bush",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "228",
    		latitude: "51.5227",
    		longitude: "-0.0708",
    		name: "Shoreditch",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "229",
    		latitude: "51.4924",
    		longitude: "-0.1565",
    		name: "Sloane Square",
    		display_name: "Sloane<br />Square",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "230",
    		latitude: "51.5808",
    		longitude: "0.0216",
    		name: "Snaresbrook",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "231",
    		latitude: "51.4454",
    		longitude: "-0.2066",
    		name: "Southfields",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "234",
    		latitude: "51.5011",
    		longitude: "-0.3072",
    		name: "South Ealing",
    		display_name: "South<br />Ealing",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "235",
    		latitude: "51.5646",
    		longitude: "-0.3521",
    		name: "South Harrow",
    		display_name: "South<br />Harrow",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "236",
    		latitude: "51.4941",
    		longitude: "-0.1738",
    		name: "South Kensington",
    		display_name: "South<br />Kensington",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "237",
    		latitude: "51.5701",
    		longitude: "-0.3081",
    		name: "South Kenton",
    		display_name: "South<br />Kenton",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "238",
    		latitude: "51.5007",
    		longitude: "-0.0191",
    		name: "South Quay",
    		display_name: "South<br />Quay",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "239",
    		latitude: "51.5569",
    		longitude: "-0.3988",
    		name: "South Ruislip",
    		display_name: "South<br />Ruislip",
    		zone: "5",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "240",
    		latitude: "51.4154",
    		longitude: "-0.1919",
    		name: "South Wimbledon",
    		display_name: "South<br />Wimbledon",
    		zone: "3.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "241",
    		latitude: "51.5917",
    		longitude: "0.0275",
    		name: "South Woodford",
    		display_name: "South<br />Woodford",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "242",
    		latitude: "51.495",
    		longitude: "-0.2459",
    		name: "Stamford Brook",
    		display_name: "Stamford<br />Brook",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "243",
    		latitude: "51.6194",
    		longitude: "-0.3028",
    		name: "Stanmore",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "244",
    		latitude: "51.5221",
    		longitude: "-0.047",
    		name: "Stepney Green",
    		display_name: "Stepney<br />Green",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "245",
    		latitude: "51.4723",
    		longitude: "-0.123",
    		name: "Stockwell",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "246",
    		latitude: "51.5439",
    		longitude: "-0.2759",
    		name: "Stonebridge Park",
    		display_name: "Stonebridge<br />Park",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "247",
    		latitude: "51.5416",
    		longitude: "-0.0042",
    		name: "Stratford",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "3",
    		rail: "1"
    	},
    	{
    		id: "248",
    		latitude: "51.4994",
    		longitude: "-0.1335",
    		name: "St. James's Park",
    		display_name: "St. James's<br />Park",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "249",
    		latitude: "51.5347",
    		longitude: "-0.174",
    		name: "St. John's Wood",
    		display_name: "St. John's<br />Wood",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "250",
    		latitude: "51.5146",
    		longitude: "-0.0973",
    		name: "St. Paul's",
    		display_name: "St. Paul's",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "251",
    		latitude: "51.5569",
    		longitude: "-0.3366",
    		name: "Sudbury Hill",
    		display_name: "Sudbury<br />Hill",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "252",
    		latitude: "51.5507",
    		longitude: "-0.3156",
    		name: "Sudbury Town",
    		display_name: "Sudbury<br />Town",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "253",
    		latitude: "51.4933",
    		longitude: "-0.0478",
    		name: "Surrey Quays",
    		display_name: "Surrey<br />Quays",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "254",
    		latitude: "51.5432",
    		longitude: "-0.1738",
    		name: "Swiss Cottage",
    		display_name: "Swiss<br />Cottage",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "255",
    		latitude: "51.5111",
    		longitude: "-0.1141",
    		name: "Temple",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "257",
    		latitude: "51.4361",
    		longitude: "-0.1598",
    		name: "Tooting Bec",
    		display_name: "Tooting<br />Bec",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "258",
    		latitude: "51.4275",
    		longitude: "-0.168",
    		name: "Tooting Broadway",
    		display_name: "Tooting<br />Broadway",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "259",
    		latitude: "51.5165",
    		longitude: "-0.131",
    		name: "Tottenham Court Road",
    		display_name: "Tottenham<br />Court<br />Road",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "260",
    		latitude: "51.5882",
    		longitude: "-0.0594",
    		name: "Tottenham Hale",
    		display_name: "Tottenham<br />Hale",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "262",
    		latitude: "51.5106",
    		longitude: "-0.0743",
    		name: "Tower Gateway",
    		display_name: "Tower<br />Gateway",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "263",
    		latitude: "51.5098",
    		longitude: "-0.0766",
    		name: "Tower Hill",
    		display_name: "Tower<br />Hill",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "264",
    		latitude: "51.5567",
    		longitude: "-0.1374",
    		name: "Tufnell Park",
    		display_name: "Tufnell<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "265",
    		latitude: "51.4951",
    		longitude: "-0.2547",
    		name: "Turnham Green",
    		display_name: "Turnham<br />Green",
    		zone: "2.5",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "266",
    		latitude: "51.5904",
    		longitude: "-0.1028",
    		name: "Turnpike Lane",
    		display_name: "Turnpike<br />Lane",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "267",
    		latitude: "51.559",
    		longitude: "0.251",
    		name: "Upminster",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "268",
    		latitude: "51.5582",
    		longitude: "0.2343",
    		name: "Upminster Bridge",
    		display_name: "Upminster<br />Bridge",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "269",
    		latitude: "51.5385",
    		longitude: "0.1014",
    		name: "Upney",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "270",
    		latitude: "51.5352",
    		longitude: "0.0343",
    		name: "Upton Park",
    		display_name: "Upton<br />Park",
    		zone: "3",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "271",
    		latitude: "51.5463",
    		longitude: "-0.4786",
    		name: "Uxbridge",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "272",
    		latitude: "51.4861",
    		longitude: "-0.1253",
    		name: "Vauxhall",
    		display_name: "NULL",
    		zone: "1.5",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "273",
    		latitude: "51.4965",
    		longitude: "-0.1447",
    		name: "Victoria",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "3",
    		rail: "1"
    	},
    	{
    		id: "274",
    		latitude: "51.583",
    		longitude: "-0.0195",
    		name: "Walthamstow Central",
    		display_name: "Walthamstow<br />Central",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "275",
    		latitude: "51.5775",
    		longitude: "0.0288",
    		name: "Wanstead",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "276",
    		latitude: "51.5043",
    		longitude: "-0.0558",
    		name: "Wapping",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "277",
    		latitude: "51.5247",
    		longitude: "-0.1384",
    		name: "Warren Street",
    		display_name: "Warren<br />Street",
    		zone: "1",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "278",
    		latitude: "51.5235",
    		longitude: "-0.1835",
    		name: "Warwick Avenue",
    		display_name: "Warwick<br />Avenue",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "279",
    		latitude: "51.5036",
    		longitude: "-0.1143",
    		name: "Waterloo",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "4",
    		rail: "1"
    	},
    	{
    		id: "281",
    		latitude: "51.5519",
    		longitude: "-0.2963",
    		name: "Wembley Central",
    		display_name: "Wembley<br />Central",
    		zone: "4",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "282",
    		latitude: "51.5635",
    		longitude: "-0.2795",
    		name: "Wembley Park",
    		display_name: "Wembley<br />Park",
    		zone: "4",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "283",
    		latitude: "51.521",
    		longitude: "-0.2011",
    		name: "Westbourne Park",
    		display_name: "Westbourne<br />Park",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "284",
    		latitude: "51.5097",
    		longitude: "-0.0265",
    		name: "Westferry",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "285",
    		latitude: "51.501",
    		longitude: "-0.1254",
    		name: "Westminster",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "286",
    		latitude: "51.518",
    		longitude: "-0.2809",
    		name: "West Acton",
    		display_name: "West<br />Acton",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "287",
    		latitude: "51.4872",
    		longitude: "-0.1953",
    		name: "West Brompton",
    		display_name: "West<br />Brompton",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "288",
    		latitude: "51.6095",
    		longitude: "-0.1883",
    		name: "West Finchley",
    		display_name: "West<br />Finchley",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "289",
    		latitude: "51.5287",
    		longitude: "0.0056",
    		name: "West Ham",
    		display_name: "West<br />Ham",
    		zone: "3",
    		total_lines: "3",
    		rail: "1"
    	},
    	{
    		id: "290",
    		latitude: "51.5469",
    		longitude: "-0.1906",
    		name: "West Hampstead",
    		display_name: "West<br />Hampstead",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "291",
    		latitude: "51.5795",
    		longitude: "-0.3533",
    		name: "West Harrow",
    		display_name: "West<br />Harrow",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "292",
    		latitude: "51.507",
    		longitude: "-0.0203",
    		name: "West India Quay",
    		display_name: "West<br />India<br />Quay",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "293",
    		latitude: "51.4907",
    		longitude: "-0.2065",
    		name: "West Kensington",
    		display_name: "West<br />Kensington",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "294",
    		latitude: "51.5696",
    		longitude: "-0.4376",
    		name: "West Ruislip",
    		display_name: "West<br />Ruislip",
    		zone: "6",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "295",
    		latitude: "51.5194",
    		longitude: "-0.0612",
    		name: "Whitechapel",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "3",
    		rail: "0"
    	},
    	{
    		id: "296",
    		latitude: "51.512",
    		longitude: "-0.2239",
    		name: "White City",
    		display_name: "White<br />City",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "297",
    		latitude: "51.5492",
    		longitude: "-0.2215",
    		name: "Willesden Green",
    		display_name: "Willesden<br />Green",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "298",
    		latitude: "51.5326",
    		longitude: "-0.2478",
    		name: "Willesden Junction",
    		display_name: "Willesden<br />Junction",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "299",
    		latitude: "51.4214",
    		longitude: "-0.2064",
    		name: "Wimbledon",
    		display_name: "NULL",
    		zone: "3",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "300",
    		latitude: "51.4343",
    		longitude: "-0.1992",
    		name: "Wimbledon Park",
    		display_name: "Wimbledon<br />Park",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "301",
    		latitude: "51.607",
    		longitude: "0.0341",
    		name: "Woodford",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "302",
    		latitude: "51.6179",
    		longitude: "-0.1856",
    		name: "Woodside Park",
    		display_name: "Woodside<br />Park",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "303",
    		latitude: "51.5975",
    		longitude: "-0.1097",
    		name: "Wood Green",
    		display_name: "Wood<br />Green",
    		zone: "3",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "35",
    		latitude: "51.4627",
    		longitude: "-0.1145",
    		name: "Brixton",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "6",
    		latitude: "51.6736",
    		longitude: "-0.607",
    		name: "Amersham",
    		display_name: "NULL",
    		zone: "10",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "23",
    		latitude: "51.4979",
    		longitude: "-0.0637",
    		name: "Bermondsey",
    		display_name: "NULL",
    		zone: "2",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "50",
    		latitude: "51.7052",
    		longitude: "-0.611",
    		name: "Chesham",
    		display_name: "NULL",
    		zone: "10",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "46",
    		latitude: "51.6679",
    		longitude: "-0.561",
    		name: "Chalfont & Latimer",
    		display_name: "Chalfont &<br />Latimer",
    		zone: "9",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "53",
    		latitude: "51.6543",
    		longitude: "-0.5183",
    		name: "Chorleywood",
    		display_name: "NULL",
    		zone: "8",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "214",
    		latitude: "51.6404",
    		longitude: "-0.4733",
    		name: "Rickmansworth",
    		display_name: "NULL",
    		zone: "7",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "62",
    		latitude: "51.647",
    		longitude: "-0.4412",
    		name: "Croxley",
    		display_name: "NULL",
    		zone: "7",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "280",
    		latitude: "51.6573",
    		longitude: "-0.4177",
    		name: "Watford",
    		display_name: "NULL",
    		zone: "8",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "221",
    		latitude: "51.5606",
    		longitude: "-0.4103",
    		name: "Ruislip Gardens",
    		display_name: "Ruislip<br />Gardens",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "121",
    		latitude: "51.6503",
    		longitude: "-0.1943",
    		name: "High Barnet",
    		display_name: "High<br />Barnet",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "261",
    		latitude: "51.6302",
    		longitude: "-0.1791",
    		name: "Totteridge & Whetstone",
    		display_name: "Totteridge<br />& Whetstone",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "57",
    		latitude: "51.6517",
    		longitude: "-0.1496",
    		name: "Cockfosters",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "187",
    		latitude: "51.6476",
    		longitude: "-0.1318",
    		name: "Oakwood",
    		display_name: "NULL",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "232",
    		latitude: "51.6322",
    		longitude: "-0.128",
    		name: "Southgate",
    		display_name: "NULL",
    		zone: "4",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "88",
    		latitude: "51.6937",
    		longitude: "0.1139",
    		name: "Epping",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "256",
    		latitude: "51.6717",
    		longitude: "0.1033",
    		name: "Theydon Bois",
    		display_name: "Theydon<br />Bois",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "68",
    		latitude: "51.6455",
    		longitude: "0.0838",
    		name: "Debden",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "158",
    		latitude: "51.6412",
    		longitude: "0.0558",
    		name: "Loughton",
    		display_name: "NULL",
    		zone: "6",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "37",
    		latitude: "51.6266",
    		longitude: "0.0471",
    		name: "Buckhurst Hill",
    		display_name: "Buckhurst<br />Hill",
    		zone: "5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "204",
    		latitude: "51.5343",
    		longitude: "-0.0139",
    		name: "Pudding Mill Lane",
    		display_name: "Pudding<br />Mill Lane",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "233",
    		latitude: "51.501",
    		longitude: "-0.1052",
    		name: "Southwark",
    		display_name: "NULL",
    		zone: "1",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "41",
    		latitude: "51.4982",
    		longitude: "-0.0502",
    		name: "Canada Water",
    		display_name: "Canada<br />Water",
    		zone: "2",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "43",
    		latitude: "51.5147",
    		longitude: "0.0082",
    		name: "Canning Town",
    		display_name: "Canning<br />Town",
    		zone: "3",
    		total_lines: "2",
    		rail: "0"
    	},
    	{
    		id: "183",
    		latitude: "51.5005",
    		longitude: "0.0039",
    		name: "North Greenwich",
    		display_name: "North<br />Greenwich",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "64",
    		latitude: "51.4827",
    		longitude: "-0.0096",
    		name: "Cutty Sark",
    		display_name: "Cutty<br />Sark",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "106",
    		latitude: "51.4781",
    		longitude: "-0.0149",
    		name: "Greenwich",
    		display_name: "NULL",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "69",
    		latitude: "51.474",
    		longitude: "-0.0216",
    		name: "Deptford Bridge",
    		display_name: "Deptford<br />Bridge",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "86",
    		latitude: "51.4693",
    		longitude: "-0.0174",
    		name: "Elverson Road",
    		display_name: "Elverson<br />Road",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "0"
    	},
    	{
    		id: "152",
    		latitude: "51.4657",
    		longitude: "-0.0142",
    		name: "Lewisham",
    		display_name: "NULL",
    		zone: "2.5",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "174",
    		latitude: "51.4767",
    		longitude: "-0.0327",
    		name: "New Cross",
    		display_name: "New<br />Cross",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	},
    	{
    		id: "175",
    		latitude: "51.4757",
    		longitude: "-0.0402",
    		name: "New Cross Gate",
    		display_name: "New<br />Cross<br />Gate",
    		zone: "2",
    		total_lines: "1",
    		rail: "1"
    	}
    ];
    var london = {
    	connections: connections,
    	lines: lines,
    	stations: stations
    };

    /* src/MultiSelect.svelte generated by Svelte v3.59.2 */

    function create_fragment$2(ctx) {
    	let multiselect;
    	let updating_selected;
    	let current;

    	function multiselect_selected_binding(value) {
    		/*multiselect_selected_binding*/ ctx[2](value);
    	}

    	let multiselect_props = { options: /*stations*/ ctx[1] };

    	if (/*selected*/ ctx[0] !== void 0) {
    		multiselect_props.selected = /*selected*/ ctx[0];
    	}

    	multiselect = new MultiSelect({ props: multiselect_props, $$inline: true });
    	binding_callbacks.push(() => bind(multiselect, 'selected', multiselect_selected_binding));

    	const block = {
    		c: function create() {
    			create_component(multiselect.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(multiselect, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const multiselect_changes = {};

    			if (!updating_selected && dirty & /*selected*/ 1) {
    				updating_selected = true;
    				multiselect_changes.selected = /*selected*/ ctx[0];
    				add_flush_callback(() => updating_selected = false);
    			}

    			multiselect.$set(multiselect_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multiselect.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multiselect.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(multiselect, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MultiSelect', slots, []);
    	const stations = london.stations.map(a => a.name);
    	let { selected = [] } = $$props;
    	const writable_props = ['selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MultiSelect> was created with unknown prop '${key}'`);
    	});

    	function multiselect_selected_binding(value) {
    		selected = value;
    		$$invalidate(0, selected);
    	}

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ MultiSelect, london, stations, selected });

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, stations, multiselect_selected_binding];
    }

    class MultiSelect_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelect_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get selected() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var dijkstra = {exports: {}};

    (function (module) {

    	/******************************************************************************
    	 * Created 2008-08-19.
    	 *
    	 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
    	 *
    	 * Copyright (C) 2008
    	 *   Wyatt Baldwin <self@wyattbaldwin.com>
    	 *   All rights reserved
    	 *
    	 * Licensed under the MIT license.
    	 *
    	 *   http://www.opensource.org/licenses/mit-license.php
    	 *
    	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    	 * THE SOFTWARE.
    	 *****************************************************************************/
    	var dijkstra = {
    	  single_source_shortest_paths: function(graph, s, d) {
    	    // Predecessor map for each node that has been encountered.
    	    // node ID => predecessor node ID
    	    var predecessors = {};

    	    // Costs of shortest paths from s to all nodes encountered.
    	    // node ID => cost
    	    var costs = {};
    	    costs[s] = 0;

    	    // Costs of shortest paths from s to all nodes encountered; differs from
    	    // `costs` in that it provides easy access to the node that currently has
    	    // the known shortest path from s.
    	    // XXX: Do we actually need both `costs` and `open`?
    	    var open = dijkstra.PriorityQueue.make();
    	    open.push(s, 0);

    	    var closest,
    	        u, v,
    	        cost_of_s_to_u,
    	        adjacent_nodes,
    	        cost_of_e,
    	        cost_of_s_to_u_plus_cost_of_e,
    	        cost_of_s_to_v,
    	        first_visit;
    	    while (!open.empty()) {
    	      // In the nodes remaining in graph that have a known cost from s,
    	      // find the node, u, that currently has the shortest path from s.
    	      closest = open.pop();
    	      u = closest.value;
    	      cost_of_s_to_u = closest.cost;

    	      // Get nodes adjacent to u...
    	      adjacent_nodes = graph[u] || {};

    	      // ...and explore the edges that connect u to those nodes, updating
    	      // the cost of the shortest paths to any or all of those nodes as
    	      // necessary. v is the node across the current edge from u.
    	      for (v in adjacent_nodes) {
    	        if (adjacent_nodes.hasOwnProperty(v)) {
    	          // Get the cost of the edge running from u to v.
    	          cost_of_e = adjacent_nodes[v];

    	          // Cost of s to u plus the cost of u to v across e--this is *a*
    	          // cost from s to v that may or may not be less than the current
    	          // known cost to v.
    	          cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

    	          // If we haven't visited v yet OR if the current known cost from s to
    	          // v is greater than the new cost we just found (cost of s to u plus
    	          // cost of u to v across e), update v's cost in the cost list and
    	          // update v's predecessor in the predecessor list (it's now u).
    	          cost_of_s_to_v = costs[v];
    	          first_visit = (typeof costs[v] === 'undefined');
    	          if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
    	            costs[v] = cost_of_s_to_u_plus_cost_of_e;
    	            open.push(v, cost_of_s_to_u_plus_cost_of_e);
    	            predecessors[v] = u;
    	          }
    	        }
    	      }
    	    }

    	    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
    	      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
    	      throw new Error(msg);
    	    }

    	    return predecessors;
    	  },

    	  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
    	    var nodes = [];
    	    var u = d;
    	    while (u) {
    	      nodes.push(u);
    	      predecessors[u];
    	      u = predecessors[u];
    	    }
    	    nodes.reverse();
    	    return nodes;
    	  },

    	  find_path: function(graph, s, d) {
    	    var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
    	    return dijkstra.extract_shortest_path_from_predecessor_list(
    	      predecessors, d);
    	  },

    	  /**
    	   * A very naive priority queue implementation.
    	   */
    	  PriorityQueue: {
    	    make: function (opts) {
    	      var T = dijkstra.PriorityQueue,
    	          t = {},
    	          key;
    	      opts = opts || {};
    	      for (key in T) {
    	        if (T.hasOwnProperty(key)) {
    	          t[key] = T[key];
    	        }
    	      }
    	      t.queue = [];
    	      t.sorter = opts.sorter || T.default_sorter;
    	      return t;
    	    },

    	    default_sorter: function (a, b) {
    	      return a.cost - b.cost;
    	    },

    	    /**
    	     * Add a new item to the queue and ensure the highest priority element
    	     * is at the front of the queue.
    	     */
    	    push: function (value, cost) {
    	      var item = {value: value, cost: cost};
    	      this.queue.push(item);
    	      this.queue.sort(this.sorter);
    	    },

    	    /**
    	     * Return the highest priority element in the queue.
    	     */
    	    pop: function () {
    	      return this.queue.shift();
    	    },

    	    empty: function () {
    	      return this.queue.length === 0;
    	    }
    	  }
    	};


    	// node.js module exports
    	{
    	  module.exports = dijkstra;
    	} 
    } (dijkstra));

    var dijkstraExports = dijkstra.exports;

    var map = [];

    function PathInfo(average, end, path) {
        this.average = average;
        this.end = end;
        this.path = path;
    }

    function getStationId(station) {
        return london.stations.find((s) => {
            return s.name == station;
        }).id;
    }

    function getStationFromId(id) {
        return london.stations.find((s) => {
            return s.id === id;
        }).name;
    }

    async function buildMap() {
        london.connections.forEach((c) => {
            let connections1 = {};
            let connections2 = {};

            if (c.station1 in map) {
                connections1 = map[c.station1];
            }
            if (c.station2 in map) {
                connections2 = map[c.station2];
            }

            connections1[c.station2] = c.time; 
            connections2[c.station1] = c.time;

            map[c.station1] = connections1;
            map[c.station2] = connections2;
        });

        return map;
    }


    function findAveragePathLength(starts, end) {
        var totalPath = 0;

        var endPathInfo = new PathInfo();
        endPathInfo.end = end;

        starts.forEach(start => {
            let startId = getStationId(start);
            let endId = getStationId(end);

            (console.log(startId + ' ' + endId));

            let thisPath = dijkstraExports.find_path(map, startId, endId);

            endPathInfo["path"] = thisPath;

            (console.log(thisPath));
            totalPath += thisPath.length;
        });

        (console.log(totalPath));

        let average = totalPath / starts.length;

        (console.log(average));

        endPathInfo.average = average;
        
        return endPathInfo;
    }

    function findMeetingPoint(starts, ends) {
        var minPathInfo = {average: -1};

        ends.forEach(end => {
            let endPathInfo = findAveragePathLength(starts, end);
            if (minPathInfo.average === -1 || minPathInfo.average > endPathInfo.average)
            {
                minPathInfo = endPathInfo;
            }
        });

        (console.log(minPathInfo));

        return minPathInfo;
    }

    /* src/MeetingPoint.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;

    const file$1 = "src/MeetingPoint.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>     import { buildMap, findMeetingPoint, getStationFromId }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { buildMap, findMeetingPoint, getStationFromId }",
    		ctx
    	});

    	return block;
    }

    // (20:0) {:then map}
    function create_then_block(ctx) {
    	let button;
    	let h3;
    	let t1;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*hasResult*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Find";
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h3, file$1, 20, 31, 472);
    			attr_dev(button, "class", "svelte-1ckacxk");
    			add_location(button, file$1, 20, 4, 445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onclick*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasResult*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(20:0) {:then map}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if hasResult}
    function create_if_block(ctx) {
    	let h2;
    	let t0_value = /*meetingPointInfo*/ ctx[1].end + "";
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let each_value = /*meetingPointInfo*/ ctx[1].path;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h2, file$1, 22, 8, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*meetingPointInfo*/ 2 && t0_value !== (t0_value = /*meetingPointInfo*/ ctx[1].end + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*getStationFromId, meetingPointInfo*/ 2) {
    				each_value = /*meetingPointInfo*/ ctx[1].path;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(22:4) {#if hasResult}",
    		ctx
    	});

    	return block;
    }

    // (24:8) {#each meetingPointInfo.path as pathPoint}
    function create_each_block(ctx) {
    	let h3;
    	let t_value = getStationFromId(/*pathPoint*/ ctx[6]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(t_value);
    			add_location(h3, file$1, 24, 12, 622);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*meetingPointInfo*/ 2 && t_value !== (t_value = getStationFromId(/*pathPoint*/ ctx[6]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(24:8) {#each meetingPointInfo.path as pathPoint}",
    		ctx
    	});

    	return block;
    }

    // (18:19)      <p>Loading...</p> {:then map}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$1, 18, 4, 411);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(18:19)      <p>Loading...</p> {:then map}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 5
    	};

    	handle_promise(buildMap(), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MeetingPoint', slots, []);
    	var hasResult = false;
    	var meetingPointInfo = null;

    	function onclick() {
    		$$invalidate(1, meetingPointInfo = findMeetingPoint(starts, ends));
    		$$invalidate(0, hasResult = true);
    		(console.log(meetingPointInfo));
    	}
    	let { starts = [] } = $$props;
    	let { ends = [] } = $$props;
    	const writable_props = ['starts', 'ends'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<MeetingPoint> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('starts' in $$props) $$invalidate(3, starts = $$props.starts);
    		if ('ends' in $$props) $$invalidate(4, ends = $$props.ends);
    	};

    	$$self.$capture_state = () => ({
    		buildMap,
    		findMeetingPoint,
    		getStationFromId,
    		hasResult,
    		meetingPointInfo,
    		onclick,
    		starts,
    		ends
    	});

    	$$self.$inject_state = $$props => {
    		if ('hasResult' in $$props) $$invalidate(0, hasResult = $$props.hasResult);
    		if ('meetingPointInfo' in $$props) $$invalidate(1, meetingPointInfo = $$props.meetingPointInfo);
    		if ('starts' in $$props) $$invalidate(3, starts = $$props.starts);
    		if ('ends' in $$props) $$invalidate(4, ends = $$props.ends);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hasResult, meetingPointInfo, onclick, starts, ends];
    }

    class MeetingPoint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { starts: 3, ends: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MeetingPoint",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get starts() {
    		throw new Error("<MeetingPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set starts(value) {
    		throw new Error("<MeetingPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ends() {
    		throw new Error("<MeetingPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ends(value) {
    		throw new Error("<MeetingPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let body;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let h20;
    	let t4;
    	let a;
    	let t6;
    	let t7;
    	let div3;
    	let div0;
    	let h21;
    	let t9;
    	let multiselect0;
    	let updating_selected;
    	let t10;
    	let div1;
    	let h22;
    	let t12;
    	let multiselect1;
    	let updating_selected_1;
    	let t13;
    	let div2;
    	let meetingpoint;
    	let current;

    	function multiselect0_selected_binding(value) {
    		/*multiselect0_selected_binding*/ ctx[3](value);
    	}

    	let multiselect0_props = {};

    	if (/*starts*/ ctx[1] !== void 0) {
    		multiselect0_props.selected = /*starts*/ ctx[1];
    	}

    	multiselect0 = new MultiSelect_1({
    			props: multiselect0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(multiselect0, 'selected', multiselect0_selected_binding));

    	function multiselect1_selected_binding(value) {
    		/*multiselect1_selected_binding*/ ctx[4](value);
    	}

    	let multiselect1_props = {};

    	if (/*ends*/ ctx[2] !== void 0) {
    		multiselect1_props.selected = /*ends*/ ctx[2];
    	}

    	multiselect1 = new MultiSelect_1({
    			props: multiselect1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(multiselect1, 'selected', multiselect1_selected_binding));

    	meetingpoint = new MeetingPoint({
    			props: {
    				starts: /*starts*/ ctx[1],
    				ends: /*ends*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			h1 = element("h1");
    			t0 = text("Hello ");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			h20 = element("h2");
    			t4 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t6 = text(" to learn how to build Svelte apps.");
    			t7 = space();
    			div3 = element("div");
    			div0 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Start stations:";
    			t9 = space();
    			create_component(multiselect0.$$.fragment);
    			t10 = space();
    			div1 = element("div");
    			h22 = element("h2");
    			h22.textContent = "End stations:";
    			t12 = space();
    			create_component(multiselect1.$$.fragment);
    			t13 = space();
    			div2 = element("div");
    			create_component(meetingpoint.$$.fragment);
    			attr_dev(h1, "class", "title svelte-tgbeii");
    			add_location(h1, file, 12, 1, 183);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			attr_dev(a, "class", "svelte-tgbeii");
    			add_location(a, file, 13, 35, 255);
    			attr_dev(h20, "class", "description svelte-tgbeii");
    			add_location(h20, file, 13, 1, 221);
    			attr_dev(h21, "class", "svelte-tgbeii");
    			add_location(h21, file, 17, 3, 403);
    			attr_dev(div0, "class", "container svelte-tgbeii");
    			add_location(div0, file, 16, 2, 376);
    			attr_dev(h22, "class", "svelte-tgbeii");
    			add_location(h22, file, 22, 3, 521);
    			attr_dev(div1, "class", "container svelte-tgbeii");
    			add_location(div1, file, 21, 2, 494);
    			attr_dev(div2, "class", "container svelte-tgbeii");
    			add_location(div2, file, 27, 2, 609);
    			attr_dev(div3, "class", "grid svelte-tgbeii");
    			add_location(div3, file, 15, 1, 355);
    			attr_dev(body, "class", "svelte-tgbeii");
    			add_location(body, file, 11, 0, 175);
    			attr_dev(main, "class", "svelte-tgbeii");
    			add_location(main, file, 10, 0, 168);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			append_dev(body, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(body, t3);
    			append_dev(body, h20);
    			append_dev(h20, t4);
    			append_dev(h20, a);
    			append_dev(h20, t6);
    			append_dev(body, t7);
    			append_dev(body, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h21);
    			append_dev(div0, t9);
    			mount_component(multiselect0, div0, null);
    			append_dev(div3, t10);
    			append_dev(div3, div1);
    			append_dev(div1, h22);
    			append_dev(div1, t12);
    			mount_component(multiselect1, div1, null);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			mount_component(meetingpoint, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    			const multiselect0_changes = {};

    			if (!updating_selected && dirty & /*starts*/ 2) {
    				updating_selected = true;
    				multiselect0_changes.selected = /*starts*/ ctx[1];
    				add_flush_callback(() => updating_selected = false);
    			}

    			multiselect0.$set(multiselect0_changes);
    			const multiselect1_changes = {};

    			if (!updating_selected_1 && dirty & /*ends*/ 4) {
    				updating_selected_1 = true;
    				multiselect1_changes.selected = /*ends*/ ctx[2];
    				add_flush_callback(() => updating_selected_1 = false);
    			}

    			multiselect1.$set(multiselect1_changes);
    			const meetingpoint_changes = {};
    			if (dirty & /*starts*/ 2) meetingpoint_changes.starts = /*starts*/ ctx[1];
    			if (dirty & /*ends*/ 4) meetingpoint_changes.ends = /*ends*/ ctx[2];
    			meetingpoint.$set(meetingpoint_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multiselect0.$$.fragment, local);
    			transition_in(multiselect1.$$.fragment, local);
    			transition_in(meetingpoint.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multiselect0.$$.fragment, local);
    			transition_out(multiselect1.$$.fragment, local);
    			transition_out(meetingpoint.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(multiselect0);
    			destroy_component(multiselect1);
    			destroy_component(meetingpoint);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let starts = [];
    	let ends = [];
    	let { name } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function multiselect0_selected_binding(value) {
    		starts = value;
    		$$invalidate(1, starts);
    	}

    	function multiselect1_selected_binding(value) {
    		ends = value;
    		$$invalidate(2, ends);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		MultiSelect: MultiSelect_1,
    		MeetingPoint,
    		starts,
    		ends,
    		name
    	});

    	$$self.$inject_state = $$props => {
    		if ('starts' in $$props) $$invalidate(1, starts = $$props.starts);
    		if ('ends' in $$props) $$invalidate(2, ends = $$props.ends);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		starts,
    		ends,
    		multiselect0_selected_binding,
    		multiselect1_selected_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
