import * as React from 'react';

export default class NavMenu extends React.PureComponent<{}, { isOpen: boolean }> {
    public state = {
        isOpen: false
    };

    public render() {
        return (
            <header>
                Header
            </header>
        );
    }

    private toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
}
