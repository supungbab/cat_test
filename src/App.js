import Breadcrumb from './Breadcrumb.js'
import Nodes from './Nodes.js'
import ImageView from './ImageView.js'
import Loading from './Loading.js'
import { request } from './api.js'

const cache = [];

export default function App($app){
    this.state = {
        isRoot: true,
        isLoading: false,
        nodes: [],
        depth: [],
        selectedFilePath: null
    }

    const loading = new Loading({
        $app,
        initialState: this.state.isLoading
    });

    const imageView = new ImageView({
        $app,
        initialState: this.state.selectedFilePath
    })

    const breadcrumb = new Breadcrumb({
        $app,
        initialState: this.state.depth
    })

    const nodes = new Nodes({
        $app,
        initialState: [],
        onClick: async (node) => {
            try {
                loading.setState(true);
                if(node.type === 'DIRECTORY') {
                    const nextNodes = await request(node.id);
                    this.setState({
                        ...this.state,
                        depth: [...this.state.depth, node],
                        nodes: nextNodes,
                        isRoot: false
                    })
                } else if(node.type === 'FILE'){
                    this.setState({
                        ...this.state,
                        selectedFilePath: node.filePath
                    })
                }
            } catch(e) {
                throw new Error('이상 이상!');
            } finally {
                loading.setState(false);
            }
        },
        onBackClick: async () => {
            try {
                loading.setState(true);
                const nextState = {...this.state}
                nextState.depth.pop()

                const prevNodeId = nextState.depth.length === 0 ? null : nextState.depth[nextState.depth.length - 1].id
                
                if(prevNodeId === null) {
                    const rootNodes = await request()
                    this.setState({
                        ...nextState,
                        isRoot: true,
                        nodes: rootNodes,
                        selectedFilePath: null
                    })
                } else {
                    const prevNodes = await request(prevNodeId)

                    this.setState({
                        ...nextState,
                        isRoot: false,
                        nodes: prevNodes,
                        selectedFilePath: null
                    })
                }
            } catch(e) {
                throw new Error(e);
            } finally {
                loading.setState(false);
            }

        }
    })

    this.setState = (nextState) => {
        this.state = nextState
        breadcrumb.setState(this.state.depth)
        nodes.setState({
            isRoot: this.state.isRoot,
            nodes: this.state.nodes
        });
        imageView.setState(this.state.selectedFilePath);
        loading.setState(this.state.isLoading);
    }

    const init = async () => {
        try {
            this.setState({
                ...this.state,
                isLoading: true
            })
            const rootNodes = await request();
            this.setState({
                ...this.state,
                isRoot: true,
                nodes: rootNodes
            })
        } catch(e){
            throw new Error('이상 이상!');
        } finally {
            this.setState({
                ...this.state,
                isLoading: false
            })
        }
    }

    init();
}