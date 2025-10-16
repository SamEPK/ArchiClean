export interface AdvisorProps {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
}

export class Advisor {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;

  constructor(props: AdvisorProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.createdAt = props.createdAt ?? new Date();
  }
}
