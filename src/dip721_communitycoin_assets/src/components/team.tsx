import * as React from "react";
import {Card, CardGroup, Container} from "react-bootstrap";

const Team = () => {

    
    return <>
     <Container className="darken">
        <h1>Team</h1>
        <p>At crypto is good we don't belive in titles. The most important thing you need to know about us is that we are all developers</p>
        <CardGroup>
      <Card>
        <Card.Img variant="top" src="cryptoisgood.png" />
        <Card.Body>
          <Card.Title>Daniel Andrade</Card.Title>
          <Card.Text>
            Influencer with over 150,000 followers across all social media. Software Engineer and architect with over 12 years of experience.
             Experience doing marketing and community management.
          </Card.Text>
        </Card.Body>
      </Card>
      <Card>
        <Card.Img variant="top" src="jonathan.jpeg" />
        <Card.Body>
          <Card.Title>Jonathan Green</Card.Title>
          <Card.Text>
          Software Engineer and blockchain developer with over 10 years of experience
          </Card.Text>
        </Card.Body>
      </Card>
      <Card>
        <Card.Img variant="top" src="holder.js/100px160" />
        <Card.Body>
          <Card.Title>Card title</Card.Title>
          <Card.Text>
            This is a wider card with supporting text below as a natural lead-in
            to additional content. This card has even longer content than the
            first to show that equal height action.
          </Card.Text>
        </Card.Body>
      </Card>
    </CardGroup>
     </Container>
    </>
    
}

export default Team