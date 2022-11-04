import * as React from "react";
import { Row, Col, Table } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { loadingAtom } from "../lib/atoms";
import { Proposal } from "../lib/dao";
import { ProposalFunction } from "../lib/http";
import { bigIntToDecimal } from "../lib/util";


const ProposalList = (props: {proposalFunction: ProposalFunction}) => {

    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [activeProposals, setActiveProposals] = React.useState([] as Proposal[]);


    React.useEffect(() => {
        setLoading(true);
        props.proposalFunction().then((proposals => {
            console.log(proposals);
            setActiveProposals(proposals)
            setLoading(false);
        }));
    }, [props.proposalFunction]);

    return <>
    <Row  className="tabs">
        <Col>
        <Table striped>
        <thead>
            <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Yay</th>
            <th>Nay</th>
            <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            {
                activeProposals.map((props: Proposal) => {
                    return <>
                    <tr key={props.id}>
                        <td>{props.id}</td>
                        <td>{props.title}</td>
                        <td>{bigIntToDecimal(props.yay).getPrettyValue(3, ",")}</td>
                        <td>{bigIntToDecimal(props.nay).getPrettyValue(3, ",")}</td>
                        <td>{new Date(Number(props.timeStamp/1000000)).toLocaleDateString()}</td>
                    </tr>
                    </>
                })
            }
        </tbody>
        </Table>
        
        </Col>
    </Row>
    </>
    
}

export default ProposalList