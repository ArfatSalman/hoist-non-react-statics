/*globals describe,it,beforeEach */
import { expect } from 'chai';
import React from 'react';
import createReactClass from 'create-react-class';
import hoistNonReactStatics from '../../index';


describe('hoist-non-react-statics', function () {

    it('should hoist non react statics', function () {
        const Component = createReactClass({
            displayName: 'Foo',
            statics: {
                foo: 'bar'
            },
            render: function () {
                return null;
            }
        });

        const Wrapper = createReactClass({
            displayName: 'Bar',
            render: function () {
                return <Component />;
            }
        });

        hoistNonReactStatics(Wrapper, Component);

        expect(Wrapper.displayName).to.equal('Bar');
        expect(Wrapper.foo).to.equal('bar');
    });

    it('should not hoist custom statics', function () {
        const Component = createReactClass({
            displayName: 'Foo',
            statics: {
                foo: 'bar'
            },
            render: function () {
                return null;
            }
        });

        const Wrapper = createReactClass({
            displayName: 'Bar',
            render: function () {
                return <Component />;
            }
        });

        hoistNonReactStatics(Wrapper, Component, {foo: true});
        expect(Wrapper.foo).to.be.undefined;
    });

    it('should not hoist statics from strings', function() {
        const Component = 'input';
        const Wrapper = createReactClass({
            render: function() {
                return <Component />;
            }
        });

        hoistNonReactStatics(Wrapper, Component);
        expect(Wrapper[0]).to.equal(undefined); // if hoisting it would equal 'i'
    });

    it('should hoist symbols', function() {
        const foo = Symbol('foo');

        const Component = createReactClass({
            render: function() {
                return null;
            }
        });

        // Manually set static property using Symbol
        // since createReactClass doesn't handle symbols passed to static
        Component[foo] = 'bar';

        const Wrapper = createReactClass({
            render: function() {
                return <Component />;
            }
        });

        hoistNonReactStatics(Wrapper, Component);

        expect(Wrapper[foo]).to.equal('bar');
    });

    it('should hoist class statics', function() {
        class Component extends React.Component {
            static foo = 'bar';
            static test() {

            }
        }

        const Wrapper = createReactClass({
            render: function() {
                return <Component />;
            }
        });

        hoistNonReactStatics(Wrapper, Component);

        expect(Wrapper.foo).to.equal(Component.foo);
        expect(Wrapper.test).to.equal(Component.test);
    });

    it('should hoist properties with accessor methods', function() {
        const Component = createReactClass({
            render: function() {
                return null;
            }
        });

        // Manually set static complex property
        // since createReactClass doesn't handle properties passed to static
        let counter = 0;
        Object.defineProperty(Component, 'foo', {
            enumerable: true,
            configurable: true,
            get: function() {
                return counter++;
            }
        });

        const Wrapper = createReactClass({
            render: function() {
                return <Component />;
            }
        });

        hoistNonReactStatics(Wrapper, Component);

        // Each access of Wrapper.foo should increment counter.
        expect(Wrapper.foo).to.equal(0);
        expect(Wrapper.foo).to.equal(1);
        expect(Wrapper.foo).to.equal(2);
    });

    it('should inherit class properties', () => {
        class A extends React.Component {
            static test3 = 'A';
            static test4 = 'D';
            test5 = 'foo';
        }
        class B extends A {
            static test2 = 'B';
            static test4 = 'DD';
        }
        class C {
            static test1 = 'C';
        }
        const D = hoistNonReactStatics(C, B);


        expect(D.test1).to.equal('C');
        expect(D.test2).to.equal('B');
        expect(D.test3).to.equal('A');
        expect(D.test4).to.equal('DD');
        expect(D.test5).to.equal(undefined);
    });

});
