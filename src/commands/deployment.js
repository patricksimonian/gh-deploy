/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {Command, flags} from '@oclif/command';
import {createDeployment} from '../index';
import {isString} from 'util';
class DeploymentCommand extends Command {
  async run() {
    const {flags} = this.parse(DeploymentCommand);
    const {repo, owner, token, ...rest} = flags;
    const options = {
      ...rest,
      environment: rest.env || rest.environment,
    };

    if (options['auto-merge']) {
      options.auto_merge = options['auto-merge'];
    }

    if (options['required-contexts']) {
      options.required_contexts = options['required-contexts'].split(',');
    }

    if (options['transient-environment']) {
      options.transient_environment = options['transient_environment'];
    }

    // if payload is a json string evaluate it
    if (options.payload && isString(options.payload)) {
      try {
        options.payload = JSON.parse(options.payload);
      } catch (e) {
        console.error('--payload flag must have a JSON formatted string as a value');
        process.exit(0);
      }
    }
    const deployment = await createDeployment(options, repo, owner, token);
    this.log(deployment.data.id);
  }
}

DeploymentCommand.description = `Creates a github deployment
...
* = required
usage: --repo=foo *
       --owner=bar * 
       --token=asdf1234 * 
       --ref=mybranch *
       --env=production
       --payload='{"hello": "world"}'
       --auto-merge=true
       --required-contexts=foo,bar,baz
       --description='this is a description'
       --transient-environment=false
returns deployment id if successful
`;

DeploymentCommand.flags = {
  'repo': flags.string({required: true, char: 'r', description: 'github repo name'}),
  'owner': flags.string({required: true, char: 'o', description: 'github owner name'}),
  'token': flags.string({required: true, char: 't', description: 'github access token (required correct permissions)'}),
  'ref': flags.string({required: true, char: 'r', description: 'github ref,branch, or commit hash'}),
  'env': flags.string({char: 'e', description: 'the deployment environment (production, qa, test, development etc)'}),
  'payload': flags.string({char: 'p', description: 'a json string that contains any extra context you need for your deployment'}),
  'auto-merge': flags.boolean({description: 'comma seperated string. auto merge the pr (see gh deployments api for reference)'}),
  'required-contexts': flags.string({description: 'parameter allows you to specify a subset of contexts that must be success'}),
  'description': flags.string({char: 'd', description: 'description for your deployment'}),
  'transient-environment': flags.boolean({description: 'Specifies if the given environment is specific to the deployment and will no longer exist at some point in the future.'}),
};

module.exports = DeploymentCommand;
